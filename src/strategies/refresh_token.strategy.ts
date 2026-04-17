import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class RefreshTokenStrtegy extends PassportStrategy(Strategy, 'jwt-refresh'){
    constructor(){
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([

                ExtractJwt.fromAuthHeaderAsBearerToken(),

                (req: Request) => {
                    let refToken = null;
                    if(req && req.cookies){
                        refToken = req.cookies['refresh_token'];
                    }
                    return refToken;
                } 
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET || 'default_refresh_secret_key',
            passReqToCallback: true  //აუცილებელია იმისათვის რომ req გვქონდეს validate მეთოდში.
        });
    }

    validate(req: Request, paylaod: any) {
        const refreshToken = req.get('authorization')?.replace('Bearer', '').trim() || req.cookies['refresh_token'];
        return {
            userId: paylaod.sub,
            email: paylaod.email,
            role: paylaod.role,
            refreshToken
        }
    }
}