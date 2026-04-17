import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

export class AtGuard extends AuthGuard('jwt'){
    constructor(private reflector: Reflector){
        super();
    }

    //(ჩემთვის) ეს ამოწმებს თუ არის რაიმე დეკორატორი რომელიც აღნიშნულია როგორც 'isPublic' და თუ არის, მაშინ ეს გარდი არ შეამოწმებს ტოკენს და პირდაპირ დაუშვებს მოთხოვნას.
    canActivate(context: ExecutionContext){
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass()
        ]);
        if(isPublic) return true;

        return super.canActivate(context);
    }
}