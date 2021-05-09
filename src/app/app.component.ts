import { DialogComponent, DialogData } from './../dialog/dialog.component';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { DataService, serverURL } from 'src/services/data.service';
import { Router } from '@angular/router';
import { User } from 'src/models/User';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy, OnInit {
  title = 'Moments';
  public fgLogin: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, Validators.required)
  });;

  public fgRegister: FormGroup = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, [Validators.required, Validators.pattern('((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{5,30})')]],
    fullName: [null, [Validators.required]],
    city: [null, [Validators.required]],
    confirmPassword: [null, [Validators.required, Validators.pattern('((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{5,30})')]]
  }, { validators: [this.checkPasswords, this.matchpattern] });

  checkPasswords(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    console.log(password, confirmPassword);

    return password === confirmPassword ? null : { notSame: true }
  }

  matchpattern(group: FormGroup) {
    const password: string = group.get('password')?.value;
    const confirmPassword: string = group.get('confirmPassword')?.value;
    if (password && confirmPassword) {
      var p = password.match("((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{5,30})")
      var cP = confirmPassword.match("((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{5,30})")
      if (p && cP)
        return null
      else
        return { patternFail: true }
    }
    else
      return null
  }


  loginScreen: boolean = true;

  public get dataService(): DataService {
    return this._dataService
  }
  hide: boolean = true;
  hideC: boolean = true;
  public async loginSuccess(user?: User) {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
      this.dataService.isLogged = true;
      this.dataService.User = user
      this.router.navigateByUrl("home");
    }
    else {
      console.log("Username not provided");
    }
  }

  public logOut() {
    sessionStorage.clear();
    this.dataService.isLogged = false;
    this.dataService.User = null;
    this.router.navigateByUrl("/")
    this.dataService.openSnackBar("Logged Out!");
  }

  mobileQuery: MediaQueryList;

  private _mobileQueryListener: () => void;
  constructor(private _dataService: DataService, private fb: FormBuilder,
    private http: HttpClient, changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher, public dialog: MatDialog, private router: Router) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

  }
  ngOnInit(): void {
    var t = sessionStorage.getItem("user");
    if (t) {
      var user = JSON.parse(t);
      this.loginSuccess(user);
    }
  }
  ngOnDestroy(): void {
  }

  openDialog(command: string, data?: any): void {
    var ddt: DialogData = new DialogData(command, data);
    var dc: MatDialogConfig = new MatDialogConfig();
    dc.data = ddt;
    dc.disableClose = true;
    if (!this.mobileQuery.matches) {
      dc.width = "300px";
      dc.position = {
        right: "50px",
        top: "80px"
      }
    }
    else {
      dc.width = "80vw";
    }
    const dialogRef = this.dialog.open(DialogComponent, dc);

    dialogRef.afterClosed().subscribe((result: DialogData) => {
      console.log('The dialog was closed ', result);
      // this.animal = result;
      switch (result?.command) {
        case 'close':
          console.log('Closed without saving');
          break;
        // case "login":
        //   var header: HttpHeaders = new HttpHeaders({
        //     'Content-Type': 'application/json'
        //   })
        //   console.log(result);
        //   var cred = result.data;
        //   this.dataService.loading = true;
        //   this.http.post(serverURL + "/login", cred, { headers: header }).subscribe(async (res: any) => {
        //     console.log(res);
        //     if (res.success) {
        //       this.loginSuccess(res.user);
        //     }
        //     else {
        //       this.dataService.openSnackBar(res.message, "Oops!", 6000)
        //     }
        //     this.dataService.loading = false;

        //   }, (err) => {
        //     this.dataService.openSnackBar(err.error.message, "Oops!", 6000)
        //     console.log(err);
        //     this.dataService.loading = false;
        //   });
        //   break;

        default:
          break;
      }
    });
  }

  public login() {

    var header: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    })

    var cred = { email: this.fgLogin.controls.email.value, password: this.fgLogin.controls.password.value }
    this.dataService.loading = true;
    this.http.post(serverURL + "/login", cred, { headers: header }).subscribe(async (res: any) => {
      console.log(res);
      if (res.success) {
        this.loginSuccess(res.user);
      }
      else {
        this.dataService.openSnackBar(res.message, "Oops!", 6000)
      }
      this.dataService.loading = false;

    }, (err) => {
      this.dataService.openSnackBar(err.error.message, "Oops!", 6000)
      console.log(err);
      this.dataService.loading = false;
    });
  }

  register() {
    console.log(this.fgRegister);
    debugger;
    var email = this.fgRegister.controls.email.value;
    console.log("Email is ", email);
    if (this.fgRegister.controls.password.value == this.fgRegister.controls.confirmPassword.value) {
      this.dataService.registerCheck(email).subscribe(resO => {
        console.log("Registry check : ", resO);
        var user = {
          email: this.fgRegister.controls.email.value, password: this.fgRegister.controls.password.value,
          confirmPassword: this.fgRegister.controls.confirmPassword.value, city: this.fgRegister.controls.city.value,
          fullName: this.fgRegister.controls.fullName.value, moments: undefined
        }
        this.dataService.register(user).subscribe(res => {
          console.log("Res :", res)
          this.dataService.openSnackBar("Your account is registered you may login.", "Great!", 6000);
        },
          err => {
            console.log("Error : ", err)
            this.dataService.openSnackBar(err.error.error)
          })
      }, err => {
        this.dataService.openSnackBar(err.error.error)
      });
    }
    else {
      console.log("Passwords do not match");
    }
  }

}
