export class User {
  email: string;
  password: string | null | undefined;
  fullName:string;
  city:string;
  moments:Array<IMoments> | undefined;
  constructor(email: string,city:string,fullName:string,moments?:Array<IMoments>,password?: string) {
    this.email = email;
    this.password = password;
    this.city=city;
    this.fullName=fullName;
    this.moments = moments;
  }
}


export interface IMoments{
  image:string,
  tags:Array<string>,
  title:string,
  time:Date,
  _id:any;
}


