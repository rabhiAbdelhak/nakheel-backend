import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import {Strategy, ExtractJwt} from 'passport-jwt';
import {Request} from 'express';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(config : ConfigService){
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(req : Request) => {
                const data = req?.cookies;
                
                return data ? data.token : null;
            }]),
            ignoreExpiration: false,
            secretOrKey: config.get('JWT_SECRET')
        });
    }
    
    validate(payload: any){
        return payload;
    }
}