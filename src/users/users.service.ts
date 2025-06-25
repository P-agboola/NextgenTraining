/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserRoles } from './enums/enum';
import { IResponse, LoginDto, UserResponse } from '../model/interface';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<IResponse> {
    const response: IResponse = {
      status: 'Failure',
      message: '',
      payload: null,
      code: 400,
    };
    const { firstName, lastName, email, password } = createUserDto;
    if (!firstName || !lastName || !email || !password) {
      // throw new Error('All fields are required');
      response.message = 'All fields are required';
      return response;
    }
    const role = createUserDto.role || UserRoles.User; // Default to User role if not provided
    const userExist = await this.userRepository.findOne({ where: { email } });
    if (userExist) {
      // throw new Error('User with this email already exists');
      response.message = 'User with this email already exists';
      return response;
    }
    try {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User();
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.password = hashedPassword;
      user.role = role as UserRoles; // Set the role from the DTO or default to User

      const savedUser = await this.userRepository.save(user);
      if (savedUser) {
        response.status = 'Success';
        response.message = 'User created successfully';
        response.code = 201;
      }
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Error creating user');
    }
  }

  async login(loginDto: LoginDto): Promise<IResponse> {
    const response: IResponse = {
      status: 'Failure',
      message: '',
      code: 400,
      payload: null,
    };
    const { email, password } = loginDto;
    if (!email || !password) {
      response.message = 'Email and password are required';
      return response;
    }
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        response.message = 'User not found';
        return response;
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        response.message = 'Invalid password';
        return response;
      }

      const payload = {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role as 'user' | 'admin', // Ensure role is either 'user' or 'admin'
      };

      const accessToken = this.jwtService.sign(payload);

      response.status = 'Success';
      response.message = 'Login successful';
      response.payload = accessToken;
      response.code = 200;
    } catch (error) {
      console.error('Error during login:', error);
      if (error instanceof Error) {
        response.message = error.message;
      } else {
        response.message = 'An unknown error occurred during login';
      }
    }
    return response;
  }

  async getAllUsers() {
    const response: IResponse = {
      status: 'Failure',
      message: '',
      code: 400,
      payload: null,
    };
    try {
      const users = await this.userRepository.find();
      if (users && users.length > 0) {
        const userResponse: UserResponse[] = [];
        for (const user of users) {
          userResponse.push({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role as 'user' | 'admin', // Ensure role is either 'user' or 'admin'
          });
        }

        response.status = 'Success';
        response.message = 'Users retrieved successfully';
        response.payload = userResponse;
        response.code = 200;
      } else {
        throw new NotFoundException('No users found');
      }
    } catch (error) {
      console.error('Error retrieving users:', error);
      if (error instanceof Error) {
        response.message = error.message;
      } else {
        response.message = 'An unknown error occurred while retrieving users';
      }
    }
    return response;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
