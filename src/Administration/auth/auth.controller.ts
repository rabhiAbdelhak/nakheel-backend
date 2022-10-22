import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { LocalAuthGuard } from './guards/local-auth-guard';
import { Request } from 'express';
import { JwtGuard } from './guards/jwt-auth-guard';
import { Public } from './decorators/public-handler.decorator';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('admin/auth')
export class AuthController {
    
    constructor(private authService: AuthService){}
    @UseGuards(LocalAuthGuard)
    @Public()
    @Post('/login')
    login(@Req() req, @Res() res, @Body() logindto: LoginDto){
        return this.authService.login(req.user, res);
    }
    
    @Public()
    @Post('/register')
    register(@Body() dto: RegisterDto,){
          return this.authService.addUser(dto);
    }
    
    @Public()
    @Get('/logout')
    logout(@Res() res){
        return this.authService.logout(res)
    }
}
