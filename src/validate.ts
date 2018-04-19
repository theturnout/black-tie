import { ValidatorOptions, ValidationError } from "class-validator";
import OclEngine from "@stekoe/ocl.js";
import "reflect-metadata";

/**
 * Validator class for OCL constraints
 */
export class Validator {
    public validate(object: Object, validatorOptions?: ValidatorOptions): Promise<ValidationError[]> {
        const validationErrors: ValidationError[] = [];
        this.oclValidate(object, validationErrors);
        return new Promise((resolve) => {
            resolve(validationErrors);
        });
    }
    private oclValidate = (objToValidate: any, validationErrors: ValidationError[]) => {
        const getOclEngine = () => {
            const oclEngine = new OclEngine();
            oclEngine.setTypeDeterminer((obj: any) => {
                // name of the class is type name
                return obj.constructor.name;
            });
            return oclEngine;
        };
        const oclEngine = getOclEngine();
        // get any constraints on the object to be validated
        const oclConstraints = Reflect.getMetadata("oclConstraint", objToValidate) as string[] | undefined;
        
        if (oclConstraints) {
            // add the constraints to the engine to be processed
            oclConstraints.forEach((oclConstraint) => oclEngine.addOclExpression(oclConstraint));
        }
        // see if the obj has any nested objects that should be validated as well
        for (const property in objToValidate) {
            if (Reflect.hasMetadata("validateNested", objToValidate, property)) {
                // recursively call the method
                this.oclValidate(objToValidate[property], validationErrors);
            }
        }

        // Evaluate an object obj against all known OCL expressions
        const validationResult = oclEngine.evaluate(objToValidate);
        validationErrors.push(...validationResult.namesOfFailedInvs);
        // map ocl.js error format to class-validator style
        // const mappedErrors = (validationResult.namesOfFailedInvs as Array<any>).map((inv: string) => {
        //     return {
        //         "value": inv,
        //         "property": "unknownjohn",
        //         "constraints": [],
        //         "children": []
        //     };
        // });
 
        //validationErrors.push(mappedErrors as any);
    };
}