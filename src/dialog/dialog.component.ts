import { DataService, Upload } from 'src/services/data.service';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { User } from 'src/models/User';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { throwError } from 'rxjs';

export class DialogData {
  command: string;
  data: any;
  constructor(command: string, data: any) {
    this.command = command; this.data = data;
  }
}
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control?.invalid && control?.parent?.dirty);
    const invalidParent = !!(control?.parent?.invalid && control?.parent?.dirty);
    console.log(invalidParent, invalidCtrl)
    return invalidCtrl || invalidParent;
  }
}
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  public fg!: FormGroup;
  private _loginScreen: boolean = true;
  public matcher = new MyErrorStateMatcher();
  file: File | null = null;
  upload: Upload | undefined;
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  public set loginScreen(v: boolean) {

    if (!v) {
      this.formGroupRegister = this.fb.group({
        email: [null, [Validators.required, Validators.email]],
        password: [null, [Validators.required,
        Validators.pattern('((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{5,30})')]],
        fullName: [null, [Validators.required]],
        city: [null, [Validators.required]],
        confirmPassword: [null, [Validators.required, Validators.pattern('((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{5,30})')]]
      }, { validators: [this.checkPasswords, this.matchpattern] });
    }
    this._loginScreen = v;
  }
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

  public get loginScreen(): boolean {
    return this._loginScreen
  }

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  public formGroupRegister !: FormGroup;
  public selectedUser: string | undefined;
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private fb: FormBuilder,
    private dataService: DataService) {

  }

  ngOnInit(): void {
    switch (this.data.command) {
      case "login":
        this.fg = this.fb.group({
          email: [null, [Validators.required, Validators.email]],
          password: [null, Validators.required]
        });
        break;
      case 'editMoment':
        console.log(this.data);
        this.data.data.newMoment = JSON.parse(JSON.stringify(this.data.data.oldMoment));
        console.log(this.data);
        break;
      default:
        break;
    }

  }
  Close(command: string, data?: any) {
    console.log(command, data);
    var ddt;
    switch (command) {
      case 'editMoment':
        ddt = new DialogData("editMoment", data);
        break;
      default:
        break;
    }
    this.dialogRef.close(ddt);
  }

  public login() {
    var ddt = new DialogData("login", { email: this.fg.controls.email.value, password: this.fg.controls.password.value })
    this.dialogRef.close(ddt);
  }

  userComparer(d1: any, d2: any) {
    console.log(d1, d2);
    if (d1 && d2)
      return d1.userName == d2.userName;
    else
      return false;
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if ((value || '').trim()) {
      this.data.data.newMoment.tags.push(value.trim());
    }
    if (input) {
      input.value = '';
    }
  }

  remove(tag: string): void {
    const index = this.data.data.newMoment.tags.indexOf(tag);

    if (index >= 0) {
      this.data.data.newMoment.tags.splice(index, 1);
    }
  }

  register() {
    console.log(this.formGroupRegister);
    debugger;
    var email = this.formGroupRegister.controls.email.value;
    console.log("Email is ", email);
    if (this.formGroupRegister.controls.password.value == this.formGroupRegister.controls.confirmPassword.value) {
      this.dataService.registerCheck(email).subscribe(resO => {
        console.log("Registry check : ", resO);
        var user = {
          email: this.formGroupRegister.controls.email.value, password: this.formGroupRegister.controls.password.value,
          confirmPassword: this.formGroupRegister.controls.confirmPassword.value, city: this.formGroupRegister.controls.city.value,
          fullName: this.formGroupRegister.controls.fullName.value, moments: undefined
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

  onFileInput(files: FileList | null | any): void {
    debugger;
    if (files) {
      var tempFile = files.item(0);
      if (tempFile) {
        if (tempFile.size > 5242880) {
          this.dataService.openSnackBar("File size is too large limit is 5mb", "Ohhh", 5000);
          return;
        }
        else if(!(tempFile.type.toLowerCase().includes("jpeg")||
        tempFile.type.toLowerCase().includes("jpg")||
        tempFile.type.toLowerCase().includes("png")))
        {
          this.dataService.openSnackBar("File allowed are png,jpg and jpeg", "Okay", 5000);
          return;
        }
        else {
          this.file = files.item(0);
          this.upload = undefined;
        }
      }
      console.log(this.file);
    }
  }

  onFileDropped($event: any) {
    this.onFileInput($event);
  }
  formatBytes(bytes: number | undefined, decimals: number) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    if (bytes) {
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    else {
      return throwError("filesize is undefined");
    }
  }

  public deleteFile() {
    this.file = null
  }

  onSubmit() {
    if (this.file) {
      this.dataService.updateMomentWithImage(this.file, this.data.data.oldMoment,
        this.data.data.newMoment).subscribe((upload) => {
          this.upload = upload;
          console.log(this.upload);

          if (upload.state == 'DONE') {
            console.log(upload);
            this.dataService.openSnackBar("Moment Updated.", "Great!", 3000);
            var ddt = new DialogData('updateWithImage', this.upload?.body.momentCreated.moment);
            this.dialogRef.close(ddt);
          }
        });
    }
  }

  public isSame(arr1: Array<string>, arr2: Array<string>): boolean {
    if (arr1?.length != arr2?.length)
      return false
    arr1.sort()
    arr2.sort()
    for (let index = 0; index < arr1.length; index++) {
      if (arr1[index] != arr2[index])
        return false
    }
    return true;
  }
}
