import { Construct } from 'constructs';
import { ICommandComponent } from '../construct/document-component';
import { CommandStep } from '../parent-steps/command-step';
import { CommandDocumentBuilder } from './document-builder';
import { SsmDocumentProps, SsmDocument } from './ssm-document';

export interface CommandDocumentProps extends SsmDocumentProps {

}

/**
 * https://docs.aws.amazon.com/systems-manager/latest/userguide/ssm-plugins.html
 * The CommandDocument will delegate execution responsibility to the CammandSteps that it receives.
 * The SsmDocument parent class contains methods to runSimulation() as well as print().
 */
export class CommandDocument extends SsmDocument {

  readonly builder: CommandDocumentBuilder;

  constructor(scope: Construct, id: string, props: CommandDocumentProps) {
    super(scope, id, props);
    this.builder = new CommandDocumentBuilder();
  }

  public addStep(component: ICommandComponent) {
    component.addToDocument(this.builder);
  }

  protected buildSsmDocument(): { [p: string]: any } {
    const runCommandSteps = this.collectedSteps().map(step => step.toSsmEntry());

    const root: { [name: string]: any } = {
      description: this.description,
      schemaVersion: '2.2',
      parameters: this.formatInputs(),
    };
    if (this.assumeRole) {
      root.assumeRole = this.assumeRole;
    }
    if (this.docOutputs.length > 0) {
      root.outputs = this.docOutputs;
    }
    root.mainSteps = runCommandSteps;
    return root;
  }

  public collectedSteps(): CommandStep[] {
    if (this.builder.steps.length == 0) {
      throw new Error('No Steps found. Either you did not declare steps or did not synthesize CDK. ' +
                'Be sure to run cdk.SynthUtils.synthesize(stack) prior to printing or running simulation');
    }
    return this.builder.steps;
  }

  public documentType(): string {
    return 'Command';
  }

}
