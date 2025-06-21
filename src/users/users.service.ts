import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserRoles } from './enums/enum';
import { IResponse, UserResponse } from '../model/interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
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
      const user = new User();
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.password = password;
      user.role = role as UserRoles; // Set the role from the DTO or default to User
      const savedUser = await this.userRepository.save(user);
      if (savedUser) {
        response.status = 'Success';
        response.message = 'User created successfully';
        response.code = 201;
      }
      return response;
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new Error('Error creating user');
    }
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
    } catch (error: any) {
      console.error('Error retrieving users:', error);
      response.message = 'Error retrieving users';
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
