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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy, OnInit {
  title = 'Moments';




  public get dataService(): DataService {
    return this._dataService
  }

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
  constructor(private _dataService: DataService,
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
        case "login":
          var header: HttpHeaders = new HttpHeaders({
            'Content-Type': 'application/json'
          })
          console.log(result);
          var cred = result.data;
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
          break;

        default:
          break;
      }
    });
  }


}
