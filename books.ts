import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Books {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;
    
}