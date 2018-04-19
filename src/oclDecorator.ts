import OclEngine from "@stekoe/ocl.js";
import "reflect-metadata";
export function ContextFor(oclExpression: string) {
    return <T extends { new(...args: any[]): {} }>(originalConstructor: T) => {
        //function newConstructor(...args: any[]) {
        //    new originalConstructor(args);
        //}
        //   newConstructor.prototype = originalConstructor.prototype;
        let columns: string[] = Reflect.getMetadata("oclConstraint", originalConstructor.prototype) || [];
        columns.push(`context ${originalConstructor.name} ${oclExpression}`);
        Reflect.defineMetadata("oclConstraint", columns, originalConstructor.prototype);
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
 * Indicates that the decorate property should be validated according
 * to it's class' ocl constraints.
 */
export function ValidateNested() {
    console.log("adding");
    return Reflect.metadata("validateNested", true);
}
