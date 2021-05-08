import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { IMoments } from './../models/User';
import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { scan } from 'rxjs/operators';
import { User } from 'src/models/User';
import {
  HttpEvent,
  HttpEventType,
  HttpResponse,
  HttpProgressEvent,
} from '@angular/common/http'

export function isHttpResponse<T>(event: HttpEvent<T>): event is HttpResponse<T> {
  return event.type === HttpEventType.Response
}

export function isHttpProgressEvent(
  event: HttpEvent<unknown>
): event is HttpProgressEvent {
  return (
    event.type === HttpEventType.DownloadProgress ||
    event.type === HttpEventType.UploadProgress
  )
}
export const calculateState = (upload: Upload, event: any): Upload => {
  console.log(upload, event);
  if (isHttpProgressEvent(event)) {
    return {
      progress: event.total
        ? Math.round((100 * event.loaded) / event.total)
        : upload.progress,
      state: 'IN_PROGRESS',
      body: undefined
    }
  }
  if (isHttpResponse(event)) {  // upload completed
    return {
      progress: 100,
      state: 'DONE',
      body: event.body
    }
  }
  return upload
}
export const serverURL = "http://localhost:4000"
export interface Upload {
  progress: number
  state: 'PENDING' | 'IN_PROGRESS' | 'DONE',
  body: any | undefined
}
@Injectable({
  providedIn: 'root'
})
export class DataService {
  public isLogged: boolean = false;
  public User: User | null = null;
  loading: boolean = false;
  public momentsListView:boolean=false;
  constructor(private http: HttpClient,private _snackBar:MatSnackBar) { }

  openSnackBar(message: string, action: string = "Ok", duration: number = 3000,
    horizontalPosition: MatSnackBarHorizontalPosition = 'right',
    verticalPosition: MatSnackBarVerticalPosition = 'bottom') {
    this._snackBar.open(message, action, {
      duration: duration,
      horizontalPosition: horizontalPosition,
      verticalPosition: verticalPosition,
    });
  }
  public register(user: User): Observable<any> {
    return this.http.post(serverURL + "/register", user)
  }

  public registerCheck(email: string): Observable<any> {
    return this.http.post(serverURL + "/registerCheck", { email: email });
  }

  public getMoments():Observable<any> {
    return this.http.post(serverURL+"/getMoments",this.User);
  }
  public deleteMoment(moment:IMoments):Observable<any> {
    let body = {
      user:this.User,
      moment:moment
    }
    return this.http.post(serverURL+"/deleteMoment",body);
  }

  public updateMomentWithoutImage(moment:IMoments,newMoment:IMoments):Observable<any> {
    let body = {
      user:this.User,
      moment:moment,
      momentNew:newMoment
    }
    return this.http.post(serverURL+"/updateMomentWithoutImage",body);
  }

  public updateMomentWithImage(imageFile: File, momentOld:IMoments,momentNew:IMoments): Observable<Upload> {
    debugger;
    const data = new FormData()
    data.set('moment', imageFile, imageFile.name);
    data.set('momentOld', JSON.stringify(momentOld));
    data.set('momentNew', JSON.stringify(momentNew));
    if (this.User) {
      data.set('user', JSON.stringify(this.User));
    }
    console.log(JSON.stringify(data))

    data.forEach((value, key) => {
      console.log("FormData -=-=-=- " + key + " " + value)
    });
    const initialState: Upload = { state: 'PENDING', progress: 0, body: undefined }
    return this.http.post(serverURL + "/updateMomentWithImage", data, { reportProgress: true, observe: 'events' }).pipe(scan(calculateState, initialState));
  }

  public uploadmoment(imageFile: File, tags: Array<string>, title: string): Observable<Upload> {
    debugger;
    const data = new FormData()
    data.set('moment', imageFile, imageFile.name);
    data.set('tags', JSON.stringify(tags));
    data.set('title', title);
    if (this.User) {
      data.set('user', JSON.stringify(this.User));
    }
    console.log(JSON.stringify(data))

    data.forEach((value, key) => {
      console.log("FormData -=-=-=- " + key + " " + value)
    });
    const initialState: Upload = { state: 'PENDING', progress: 0, body: undefined }
    return this.http.post(serverURL + "/uploadImage", data, { reportProgress: true, observe: 'events' }).pipe(scan(calculateState, initialState));
  }
}
