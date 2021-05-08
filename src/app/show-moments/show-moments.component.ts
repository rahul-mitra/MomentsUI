import { Subscription } from 'rxjs';
import { DataService } from 'src/services/data.service';
import { IMoments } from './../../models/User';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogData, DialogComponent } from 'src/dialog/dialog.component';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-show-moments',
  templateUrl: './show-moments.component.html',
  styleUrls: ['./show-moments.component.scss']
})
export class ShowMomentsComponent implements OnInit {
  private _mobileQueryListener: () => void;
  mobileQuery: MediaQueryList;
  public momentSubscription: Subscription;
  displayedColumns: string[] = ['index', 'time','image', 'title', 'tags', 'actions'];
  dataSource!: MatTableDataSource<IMoments>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(private dataService: DataService, media: MediaMatcher, public dialog: MatDialog, changeDetectorRef: ChangeDetectorRef) {

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.momentSubscription = this.dataService.getMoments().subscribe((res) => {
      console.log(res);
      this.MomentsList = res;
      if (this.MomentsList) {
        this.dataSource = new MatTableDataSource<IMoments>(this.MomentsList.map(m => {
          return {
            ...m, index: this.MomentsList?.indexOf(m) ?
              this.MomentsList?.indexOf(m) + 1 : this.MomentsList?.indexOf(m) == 0 ? 1 : 0
          }
        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    },
      err => {
        console.log(err);
        this.dataService.openSnackBar(err.error.error, "Oops", 4000);
      });
  }
  MomentsList: Array<IMoments> | undefined;
  ngOnInit(): void {
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public deleteMoment(moment: IMoments) {
    this.dataService.deleteMoment(moment).subscribe(res => {
      console.log(res);
      debugger;
      this.dataService.openSnackBar(res.message, "Cool", 5000);
      this.MomentsList = res.moments;
      if (this.MomentsList) {
        this.dataSource = new MatTableDataSource<IMoments>(this.MomentsList.map(m => {
          return {
            ...m, index: this.MomentsList?.indexOf(m) ?
              this.MomentsList?.indexOf(m) + 1 : this.MomentsList?.indexOf(m) == 0 ? 1 : 0
          }
        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    }, err => {
      console.log(err);
      this.dataService.openSnackBar(err.error.error, "Oops!", 5000);
    })
  }

  openDialog(command: string, data?: any): void {
    var ddt: DialogData = new DialogData(command, data);
    var dc: MatDialogConfig = new MatDialogConfig();
    dc.data = ddt;
    dc.disableClose = true;
    if (!this.mobileQuery.matches && command!='editMoment') {
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
          case 'editMoment':

            delete data.oldMoment.index;
            delete data.newMoment.index;
            console.log("Edit saved moment ",result);
            this.dataService.updateMomentWithoutImage(data.oldMoment,data.newMoment).subscribe(res => {
              console.log(res);
              debugger;
              this.dataService.openSnackBar(res.message, "Cool", 5000);
              this.MomentsList = res.moments;
              if (this.MomentsList) {
                this.dataSource = new MatTableDataSource<IMoments>(this.MomentsList.map(m => {
                  return {
                    ...m, index: this.MomentsList?.indexOf(m) ?
                      this.MomentsList?.indexOf(m) + 1 : this.MomentsList?.indexOf(m) == 0 ? 1 : 0
                  }
                }));
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
              }
            }, err => {
              console.log(err);
              this.dataService.openSnackBar(err.error.error, "Oops!", 5000);
            })
            break;
            case 'updateWithImage':
              console.log("Edit with image saved moment ",result);
                debugger;
                this.MomentsList = result.data;
                if (this.MomentsList) {
                  this.dataSource = new MatTableDataSource<IMoments>(this.MomentsList.map(m => {
                    return {
                      ...m, index: this.MomentsList?.indexOf(m) ?
                        this.MomentsList?.indexOf(m) + 1 : this.MomentsList?.indexOf(m) == 0 ? 1 : 0
                    }
                  }));
                  this.dataSource.paginator = this.paginator;
                  this.dataSource.sort = this.sort;
                }
              break;
        default:
          break;
      }
    });
  }

}
