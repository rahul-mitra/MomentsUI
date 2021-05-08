import { DataService } from 'src/services/data.service';
import { ChangeDetectorRef, Component, ComponentRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { User } from 'src/models/User';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogData, DialogComponent } from 'src/dialog/dialog.component';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ComponentFactoryResolver } from '@angular/core';
import { ComponentFactory } from '@angular/core';
import { Md5 } from 'ts-md5';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  private _mobileQueryListener: () => void;
  mobileQuery: MediaQueryList;
  public UserList: Array<User> = new Array<User>();
  public subs: Array<Subscription> = new Array<Subscription>()
  public get dataService(): DataService {
    return this._dataService;
  }
  // @ViewChild("child", { read: ViewContainerRef })
  // container!: ViewContainerRef;

  constructor(private _dataService: DataService,
    private http: HttpClient, changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher, public dialog: MatDialog, private router: Router, private resolver: ComponentFactoryResolver) {
    //constructor


    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    //constructor ends

  }
  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  ngOnInit(): void {
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
      switch (result?.command) {
        case 'close':
          console.log('Closed without saving');
          break;
        default:
          break;
      }
    });
  }

}
