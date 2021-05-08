import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Upload } from './../../services/data.service';
import { DataService } from 'src/services/data.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, throwError } from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
@Component({
  selector: 'app-add-moments',
  templateUrl: './add-moments.component.html',
  styleUrls: ['./add-moments.component.scss']
})
export class AddMomentsComponent implements OnInit, OnDestroy {
  file: File | null = null;
  upload: Upload | undefined;
  permitUpload: boolean = true;
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  tags: Array<string> = new Array<string>("tag1");
  title: string = "Test Upload";


  constructor(private dataservice: DataService) {

  }
  private subscription: Subscription | undefined
  ngOnInit(): void {
  }

  onFileInput(files: FileList | null): void {
    if (files) {
      var tempFile = files.item(0);
      if (tempFile) {
        if (tempFile.size > 5242880) {
          this.dataservice.openSnackBar("File size is too large limit is 5mb", "Ohhh", 5000);
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


  fileBrowseHandler(files: any) {
    this.onFileInput(files);
  }


  onSubmit() {

    if(!(this.tags?.length>0&&this.title?.length>0))
    {
      this.dataservice.openSnackBar("Tags and Title are essential", "Okay", 5000);
      return;
    }
    if (this.file) {
      this.permitUpload = false;
      this.subscription = this.dataservice.uploadmoment(this.file, this.tags,
        this.title).subscribe((upload) => {
          this.upload = upload;
          console.log(this.upload);
          if (upload.state == 'DONE') {
            this.dataservice.openSnackBar("Moment created.", "Great!", 3000);
            setTimeout(() => {
              this.dataservice.openSnackBar("Total moments uploaded till now : " + this.upload?.body.momentCreated.moment.length, "Okay", 3000);
              this.file = null;
              this.tags = new Array<string>("Tag 1");
              this.title = "Title 1";
              this.permitUpload = true;
            }, 3000);
          }
        });
    }
    else {
      this.dataservice.openSnackBar("Please attach a file first", "Okay", 5000);
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe()
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if ((value || '').trim()) {
      this.tags.push(value.trim());
    }
    if (input) {
      input.value = '';
    }
  }

  remove(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
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

}
