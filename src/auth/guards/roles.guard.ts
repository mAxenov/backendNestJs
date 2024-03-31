import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true; // Если роли не указаны, разрешаем доступ
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const hasRequiredRoles = requiredRoles.some((role) =>
      user.role.includes(role),
    );

    if (!hasRequiredRoles) {
      throw new ForbiddenException(`role is not ${requiredRoles}`);
    }

    return true;
  }
}
