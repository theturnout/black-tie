import OclEngine from "@stekoe/ocl.js";
import "reflect-metadata";
import { ValidationOptions } from "class-validator";
import { ValidationMetadataArgs } from "class-validator/metadata/ValidationMetadataArgs";
/**
 * Specifies the context for which a constraint (e.g. invariant) applies.
 * @param oclExpression The OCL constraint constraint, with `context` clause omitted
 * @param validationOptions The options that modify the behavior of the validator.
 */
export function ContextFor(oclExpression: string, validationOptions?: ValidationOptions) {
    return <T extends { new(...args: any[]): {} }>(originalConstructor: T) => {
        let columns: ValidationMetadataArgs[] = Reflect.getMetadata("oclConstraint", originalConstructor.prototype) || [];        
        const args: ValidationMetadataArgs = {
            type: "oclInvariant",
            target: originalConstructor.constructor,
            propertyName: "whatsthis",
            constraints: [`context ${originalConstructor.name} ${oclExpression}`],
            validationOptions: validationOptions
        };
        columns.push(args);
        Reflect.defineMetadata("oclConstraint", columns, originalConstructor.prototype);
        //Reflect.defineMetadata("oclContext", originalConstructor.name, originalConstructor.prototype);
        return originalConstructor;
    };
}
export function ContextForPostcondition(oclExpression: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        // save a reference to the original method this way we keep the values currently in the
        // descriptor and don't overwrite what another decorator might have done to the descriptor.
        // if (descriptor === undefined) {
        //     descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        // }
        var originalMethod = descriptor.value;
        //editing the descriptor/value parameter
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var a = args.map(function (a) { return JSON.stringify(a); }).join();
            // note usage of originalMethod here
            var result = originalMethod.apply(this, args);
            //post conditional logic
            var r = JSON.stringify(result);
            console.log("Call: " + propertyKey + "(" + a + ") => " + r);
            return result;
        };

        // return edited descriptor as opposed to overwriting the descriptor
        return descriptor;

    };
}
/**
 * Indicates that the decorated property should be validated according
 * to its class' OCL constraints.
 */
export function ValidateNested() {
    return Reflect.metadata("validateNested", true);
}
