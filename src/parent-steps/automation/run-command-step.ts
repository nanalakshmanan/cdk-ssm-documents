import { Construct } from 'constructs';import { DataTypeEnum } from '../..';
import { Output } from '../../domain/output';
import { IMapListVariable } from '../../interface/variables/map-list-variable';
import { INumberVariable } from '../../interface/variables/number-variable';
import { IStringListVariable } from '../../interface/variables/string-list-variable';
import { IStringMapVariable } from '../../interface/variables/string-map-variable';
import { assertString, HardCodedString, IStringVariable, StringVariable } from '../../interface/variables/string-variable';
import { pruneAndTransformRecord } from '../../utils/prune-and-transform-record';
import { AutomationStep, AutomationStepProps } from '../automation-step';

export interface IDocumentHashTypeVariable extends IStringVariable {
}

export class HardCodedDocumentHashType extends HardCodedString implements IDocumentHashTypeVariable {
  public static readonly SHA256 = new HardCodedDocumentHashType('Sha256');
  public static readonly SHA1 = new HardCodedDocumentHashType('Sha1');
  private constructor(val: string) {
    super(val);
  }
}

export class DocumentHashTypeVariable extends StringVariable implements IDocumentHashTypeVariable {
  readonly validValues = ['Sha256', 'Sha1'];

  protected assertType(value: any): void {
    assertString(value);
    if (!this.validValues.includes(value)) {
      throw new Error(`${value} is not a valid enum value`);
    }
  }
}
/**
 * Properties for RunCommandStep
 */
export interface RunCommandStepProps extends AutomationStepProps {

  /**
     * If the Command type document is owned by you or AWS, specify the name of the document. If you're using a document shared with you by a different AWS account, specify the Amazon Resource Name (ARN) of the document.
     */
  readonly documentName: IStringVariable;

  /**
     * The instance IDs where you want the command to run. You can specify a maximum of 50 IDs.
     *
     * You can also use the pseudo parameter {{RESOURCE_ID}} in place of instance IDs to run the command on all instances in the target group. For more information about pseudo parameters, see [About pseudo parameters](https://docs.aws.amazon.com/systems-manager/latest/userguide/mw-cli-register-tasks-parameters.html).
     *
     * Another alternative is to send commands to a fleet of instances by using the Targets parameter. The Targets parameter accepts Amazon Elastic Compute Cloud (Amazon EC2) tags. For more information about how to use the Targets parameter, see [Using targets and rate controls to send commands to a fleet](https://docs.aws.amazon.com/systems-manager/latest/userguide/send-commands-multiple.html).
     */
  readonly targets: IStringListVariable | IMapListVariable;

  /**
     * (Optional) The required and optional parameters specified in the document.
     */
  readonly parameters?: IStringMapVariable;

  /**
     * (Optional) Configuration options for sending command output to Amazon CloudWatch Logs. For more information about sending command output to CloudWatch Logs, see [Configuring Amazon CloudWatch Logs for Run Command](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-rc-setting-up-cwlogs.html).
     */
  readonly cloudWatchOutputConfig?: IStringMapVariable;

  /**
     * (Optional) User-defined information about the command.
     */
  readonly comment?: IStringVariable;

  /**
     * (Optional) The hash for the document.
     */
  readonly documentHash?: IStringVariable;

  /**
     * (Optional) The type of the hash.
     */
  readonly documentHashType?: IDocumentHashTypeVariable;

  /**
     * (Optional) The configurations for sending notifications.
     */
  readonly notificationConfig?: IStringMapVariable;

  /**
     * (Optional) The name of the S3 bucket for command output responses.
     */
  readonly outputS3BucketName?: IStringVariable;

  /**
     * (Optional) The prefix.
     */
  readonly outputS3KeyPrefix?: IStringVariable;

  /**
     * (Optional) The ARN of the AWS Identity and Access Management (IAM) role.
     */
  readonly serviceRoleArn?: IStringVariable;

  /**
     * (Optional) The amount of time in seconds to wait for a command to deliver to the AWS Systems Manager SSM Agent on an instance. If the command isn't received by the SSM Agent on the instance before the value specified is reached, then the status of the command changes to Delivery Timed Out.
     */
  readonly commandTimeoutSeconds?: INumberVariable;

  /**
     * (Optional) The maximum concurrency.
     */
  readonly maxConcurrency?: INumberVariable;

  /**
     * (Optional) The maximum errors.
     */
  readonly maxErrors?: INumberVariable;
}

/**
 * AutomationStep implementation of [aws:runCommand](https://docs.aws.amazon.com/systems-manager/latest/userguide/automation-action-runcommand.html)
 */
export class RunCommandStep extends AutomationStep {
  readonly action = 'aws:runCommand';
  readonly documentName: IStringVariable;
  readonly targets: IStringListVariable | IMapListVariable;
  readonly parameters?: IStringMapVariable;
  readonly cloudWatchOutputConfig?: IStringMapVariable;
  readonly comment?: IStringVariable;
  readonly documentHash?: IStringVariable;
  readonly documentHashType?: IDocumentHashTypeVariable;
  readonly notificationConfig?: IStringMapVariable;
  readonly outputS3BucketName?: IStringVariable;
  readonly outputS3KeyPrefix?: IStringVariable;
  readonly serviceRoleArn?: IStringVariable;
  readonly commandTimeoutSeconds?: INumberVariable;
  readonly maxConcurrency?: INumberVariable;
  readonly maxErrors?: INumberVariable;

  constructor(scope: Construct, id: string, props: RunCommandStepProps) {
    super(scope, id, props);
    this.documentName = props.documentName;
    this.targets = props.targets;
    this.parameters = props.parameters;
    this.cloudWatchOutputConfig = props.cloudWatchOutputConfig;
    this.comment = props.comment;
    this.documentHash = props.documentHash;
    this.documentHashType = props.documentHashType;
    this.notificationConfig = props.notificationConfig;
    this.outputS3BucketName = props.outputS3BucketName;
    this.outputS3KeyPrefix = props.outputS3KeyPrefix;
    this.serviceRoleArn = props.serviceRoleArn;
    this.commandTimeoutSeconds = props.commandTimeoutSeconds;
    this.maxConcurrency = props.maxConcurrency;
    this.maxErrors = props.maxErrors;
  }

  public listOutputs(): Output[] {
    return [{
      outputType: DataTypeEnum.STRING,
      selector: '$.CommandId',
      name: 'CommandId',
    }, {
      outputType: DataTypeEnum.STRING,
      selector: '$.Status',
      name: 'Status',
    }, {
      outputType: DataTypeEnum.INTEGER,
      selector: '$.ResponseCode',
      name: 'ResponseCode',
    }, {
      outputType: DataTypeEnum.STRING,
      selector: '$.Output',
      name: 'Output',
    }];
  }

  public listInputs(): string[] {
    const inputs = [
      this.documentName,
      this.targets,
      this.parameters,
      this.cloudWatchOutputConfig,
      this.comment,
      this.documentHash,
      this.documentHashType,
      this.notificationConfig,
      this.outputS3BucketName,
      this.outputS3KeyPrefix,
      this.serviceRoleArn,
      this.commandTimeoutSeconds,
      this.maxConcurrency,
      this.maxErrors,
    ];

    return inputs.flatMap(i => i?.requiredInputs() ?? []);
  }

  public toSsmEntry(): Record<string, any> {
    const entryMap: Record<string, any> = {
      DocumentName: this.documentName,
      Parameters: this.parameters,
      CloudWatchOutputConfig: this.cloudWatchOutputConfig,
      Comment: this.comment,
      DocumentHash: this.documentHash,
      DocumentHashType: this.documentHashType,
      NotificationConfig: this.notificationConfig,
      OutputS3BucketName: this.outputS3BucketName,
      OutputS3KeyPrefix: this.outputS3KeyPrefix,
      ServiceRoleArn: this.serviceRoleArn,
      TimeoutSeconds: this.commandTimeoutSeconds,
      MaxConcurrency: this.maxConcurrency,
      MaxErrors: this.maxErrors,
    };
    if ((this.targets as any)?.resolveToStringList) {
      entryMap.InstanceIds = this.targets;
    } else {
      entryMap.Targets = this.targets;
    }

    return super.prepareSsmEntry(pruneAndTransformRecord(entryMap, x => x.print()));
  }
}