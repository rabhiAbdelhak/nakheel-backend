import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private userService: UserService,
  ) {}

  async verifyUser(username: string, password: string) {
    //find the user with username coming in the request
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new NotFoundException("Cet utilisateur n'existe pas");
    }
    if(user.isBlocked){
      throw new ForbiddenException('Vous ne pouvez pas connecter, vous ètes bloqué par l\'admin du system')
    }
    // compare passwords
    const pwdMatches = await argon.verify(user.password, password);
    if (!pwdMatches) {
      throw new BadRequestException('Mot de passe erroné');
    }
    //connection successfully established
    return user;
  }

  async login(user: any, res: Response) {
    const { id, firstname, lastname, email , isAdmin} = user;
    //get the user permissions in order to add them to the token payload
    const permissions = await this.userService.getUserPermissions(id);
    const payload = { id, firstname, lastname, email, isAdmin, permissions };
    const token = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_TIME'),
    });
    const oneday = 1000 * 3600 * 24;
    const tt = res.cookie('token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + oneday),
    });
    return res.status(200).json({msg: 'Vous étes connectés', access_token: token, user: payload});
  }

  async addUser(dto: RegisterDto) {
      //starting with hashing the the coming password
      const password = await argon.hash(dto.password);

      //generate the add request with prisma service
      const user = await this.prisma.user.create({
        data: { ...dto, password },
      });

      //inform the user that he added a user
      return { msg: 'Vous avez ajouté un utilisateur', user };
  }

  logout(@Res({ passthrough: true }) res) {
    res.cookie('token', '');
    res.status(200).json({ msg: 'Vous ètes déconnectés maintenant !' });
  }
}
