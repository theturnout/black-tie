global.window = undefined; // Needed to avoid exception at import..
import { ValidatorOptions, ValidationError } from "class-validator";
import  OclEngine from "@stekoe/ocl.js";
import "reflect-metadata";
import { ValidationMetadataArgs } from "class-validator/metadata/ValidationMetadataArgs";

/**
 * Validator class for OCL constraints
 */
export class Validator {
    /**
     * 
     * @param object The annotated object to validate.
     * @param validatorOptions Options to pass to the validator.
     */
    public validate(object: Object, validatorOptions?: ValidatorOptions): Promise<ValidationError[]> {
        const validationErrors: ValidationError[] = [];
        this.oclValidate(object, validationErrors);
        return new Promise((resolve) => {
            resolve(validationErrors);
        });
    }
    /**
     * 
     * @param objToValidate Object subject to validation
     * @param validationErrors The validation errors resultant from applying constraints
     */
    private oclValidate(objToValidate: any, validationErrors: ValidationError[]) {
        const getOclEngine = () => {
            const oclEngine = new OclEngine();
            oclEngine.setTypeDeterminer((obj: any) => {
                // name of the class is type name
                return obj.constructor.name;
            });
            return oclEngine;
        };
        const oclEngine = getOclEngine();

        const oclExpressions = Reflect.getMetadata("oclConstraint", objToValidate) as ValidationMetadataArgs[] | undefined;
        if (oclExpressions) {
            // add the constraints to the engine to be processed
            oclExpressions.forEach((oclExpression) => {
                oclEngine.addOclExpression(oclExpression.constraints && oclExpression.constraints[0])
            });
        }
        // see if the obj has any nested objects that should be validated as well
        for (const property in objToValidate) {
            if (Reflect.hasMetadata("validateNested", objToValidate, property)) {
                // recursively call this method
                this.oclValidate(objToValidate[property], validationErrors);
            }
        }

        // Evaluate an object obj against all known OCL expressions
        const validationResult = oclEngine.evaluate(objToValidate);
        // push the validation errors to the array
        validationErrors.push(...validationResult.namesOfFailedInvs);
        //  map ocl.js error format to class-validator style
        // const mappedErrors = (validationResult.namesOfFailedInvs as Array<any>).map((inv: string) => {
        //     // need to pull back the invariant name, but that is difficult without the parser!
        //     return oclExpressions!.filter(o => o.constraints![0].split(" ")[3] === inv)[0]
        // });
        // validationErrors.push(mappedErrors as any);
    };
}