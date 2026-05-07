import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class AtGuard extends AuthGuard('jwt'){
    constructor(private reflector: Reflector){
        super();
    }

    async canActivate(context: ExecutionContext){
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass()
        ]);

        if(isPublic){
            try {
                const canActivate = await super.canActivate(context); //თუ ფაბლიქია,მაგრამ დალოგინებული არა,  super.canactivate ისვრის ერორს, ვიჭერთ ქეჩიტ და მაინც ვაბრუნებთ თრუს.(ეს რთავს ნებას დაულოგინებელ იუზერს)  
                return canActivate as boolean;
            } catch {
                return true;
            }
        }

        return super.canActivate(context) as Promise<boolean>;
    }
}