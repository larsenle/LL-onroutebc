import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { Base } from '../../common/entities/base.entity';
import { ApplicationStatus } from '../../common/enum/application-status.enum';
import { PermitTransaction } from './permit-transaction.entity';
import { PermitType } from '../enum/permit-type.enum';
import { PermitData } from './permit-data.entity';
import { PermitApprovalSource } from 'src/common/enum/permit-approval-source.enum';
import { Company } from './company.entity';

@Entity({ name: 'permit.ORBC_PERMIT' })
export class Permit extends Base {
  @AutoMap()
  @ApiProperty({
    example: '1',
    description: 'Unique identifier for the permit metadata.',
  })
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'ID' })
  permitId: string;

  @AutoMap()
  @ApiProperty({
    example: 'P2-00000002-120',
    description:
      'Unique formatted permit number, recorded once the permit is approved and issued.',
  })
  @Column({
    length: '19',
    name: 'PERMIT_NUMBER',
    nullable: true,
  })
  permitNumber: string;

  @AutoMap()
  @ApiProperty({
    example: '74',
    description:
      'Foreign key to the ORBC_COMPANY table, represents the company requesting the permit.',
  })
  @ManyToOne(() => Company, { eager: true, cascade: false })
  @JoinColumn({ name: 'COMPANY_ID' })
  company: Company;

  @AutoMap()
  @ApiProperty({
    example: '08-000-2819',
    description:
      'Unique formatted tps permit number, recorded once the permit is moved from tps migrated permit table.',
  })
  @Column({
    length: '19',
    name: 'TPS_PERMIT_NUMBER',
    nullable: true,
  })
  tpsPermitNumber: string;

  @AutoMap()
  @ApiProperty({
    description: 'DMS Document ID used to retrieve the PDF of the permit',
  })
  @Column({
    name: 'DOCUMENT_ID',
    nullable: true,
  })
  documentId: string;

  @AutoMap()
  @ApiProperty({
    example: '1',
    description: 'Represents the revision number for a permit.',
  })
  @Column({ type: 'integer', name: 'REVISION' })
  revision: number;

  @AutoMap()
  @ApiProperty({
    example: ApplicationStatus.IN_PROGRESS,
    description:
      'State of a permit or permit application, at any given point in time',
  })
  @Column({
    length: 20,
    name: 'PERMIT_STATUS_TYPE',
    nullable: true,
  })
  permitStatus: ApplicationStatus;

  @OneToMany(
    () => PermitTransaction,
    (permitTransaction) => permitTransaction.permit,
  )
  public permitTransactions: PermitTransaction[];

  @AutoMap()
  @ApiProperty({
    example: 'dbo',
    description: 'Permit Last Updated User ID ',
  })
  @Column({
    name: 'DB_LAST_UPDATE_USERID',
  })
  lastUpdateUser: string;

  @AutoMap()
  @ApiProperty({
    example: '2023-07-13T17:31:17.470Z',
    description: 'Permit Last Updated Date ',
  })
  @Column({
    name: 'DB_LAST_UPDATE_TIMESTAMP',
  })
  lastUpdateTimestamp: Date;
  @AutoMap()
  @ApiProperty({
    enum: PermitType,
    description: 'Friendly name for the permit type',
    example: PermitType.TERM_OVERSIZE,
  })
  @Column({
    type: 'simple-enum',
    enum: PermitType,
    length: 10,
    name: 'PERMIT_TYPE',
    nullable: true,
  })
  permitType: PermitType;

  @AutoMap()
  @ApiProperty({
    enum: PermitApprovalSource,
    description: 'Name for the permit approval source',
    example: PermitApprovalSource.PPC,
  })
  @Column({
    type: 'simple-enum',
    enum: PermitApprovalSource,
    length: 10,
    name: 'PERMIT_APPROVAL_SOURCE_TYPE',
    nullable: true,
  })
  permitApprovalSource: PermitApprovalSource;

  @AutoMap()
  @ApiProperty({
    example: '2023-07-13T17:31:17.470Z',
    description: 'Permit Issue Date ',
  })
  @Column({
    name: 'PERMIT_ISSUE_DATE_TIME',
    nullable: true,
  })
  permitIssueDateTime: Date;

  @AutoMap(() => PermitData)
  @OneToOne(() => PermitData, (PermitData) => PermitData.permit, {
    cascade: true,
  })
  permitData: PermitData;
}
