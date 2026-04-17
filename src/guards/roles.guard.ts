import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate{
    constructor( private reflector: Reflector){}

    canActivate(context : ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ])

        if(!requiredRoles) return true;
        const {user} = context.switchToHttp().getRequest();

        if (!user) {
            throw new ForbiddenException('User not found in request');
        }

        const hasPermission =  requiredRoles.some((role) =>  user.role === role);
        if(!hasPermission){
            throw new ForbiddenException('You do not have permission to access this resource');
        }
        return true;
    }
}