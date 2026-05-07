import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../custom_decorators/public.decorator";

@Injectable()
export class RolesGuard implements CanActivate{
    constructor( private reflector: Reflector){}

    canActivate(context : ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [  //(ჩემთვის) ვამოწმებ არის თუ არა ფაბლიქი, პრველ რიგში ეს მოწმდება
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) { //ტუ არის, ნებას ვრთავ წვდომაზე
            return true; 
        }


        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ])


        if(!requiredRoles || requiredRoles.length === 0){
            return true;
        }

        const{ user } = context.switchToHttp().getRequest();

        if(!user){
            return false;
        }

        return requiredRoles.some((role) => user.role?.includes(role));
    }
}