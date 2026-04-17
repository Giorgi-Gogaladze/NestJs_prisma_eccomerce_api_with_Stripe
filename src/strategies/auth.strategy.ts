import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt} from "passport-jwt";
import { Request } from "express";
import { Injectable } from "@nestjs/common";

//(ჩემთვის) ვიღებთ ტოკენს ჰედერიდან ანდ ქუქიებიდან და ვამოწმებთ ვალიდურობას, თუ ვალიდურია, ვაბრუნებთ payload_ს, ანუ @User დეკორატორი დააბრუნდებს ამ paylaod_ის დეითას, მეტს არაფერს.
@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(){
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                
            ExtractJwt.fromAuthHeaderAsBearerToken(),

            (req: Request) => {
                let token = null;
                if(req && req.cookies){
                    token = req.cookies['access_token']
                }
               return token; 
            }
        ]),
            ignoreExpiration: false,  //თუ ტოკენი არ არის ვალიდური, მაშინ მოთხოვნა არ დიაშვება
            secretOrKey: process.env.JWT_SECRET || 'default_secret_key'
        });
    }

    async validate(payload: any){
        return {userId: payload.sub, email: payload.email, role: payload.role};
    }
}