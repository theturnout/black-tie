global.window = undefined; // Needed to avoid exception at import..
import { Validator } from "../src/validate";
import { expect } from "chai";
import { ContextFor, ValidateNested } from "../src/oclDecorator";
// -------------------------------------------------------------------------
// Setup
// -------------------------------------------------------------------------
const validator = new Validator();

// -------------------------------------------------------------------------
// Specifications: common decorators
// -------------------------------------------------------------------------
describe("conditional validation", async function () {
    it("should validate successfully on implication constraint", async function () {
        @ContextFor(`inv firstPlusLast: (self.FirstName = "jim" and self.LastName = "davis")
             implies self.FullName = "jim davis"`)
        class Name {
            FullName?: string;
            LastName?: string;
            FirstName?: string;
        }

        const name = new Name();
        name.FirstName = "jim";
        name.FullName = "jim davis";
        name.LastName = "davis";

        const errors = await validator.validate(name);
        expect(errors.length).to.equal(0);
    });

});
describe("exclusive or", async function () {
    const exclusiveConstraint = `inv serviceOrProduct: self.service->oclIsUndefined() xor self.product->oclIsUndefined()`;            
    it("should validate successfully on exclusive constraint", async function () {

        @ContextFor(exclusiveConstraint)
        class SoldVia {
            product?: object;
            service?: object;
        }

        const soldVia = new SoldVia();
        soldVia.product = {};

        const errors = await validator.validate(soldVia);
        expect(errors.length).to.equal(0);
    });
    it("should validate successfully on exclusive constraint", async function () {

        @ContextFor(exclusiveConstraint)
        class SoldVia {
            product?: object;
            service?: object;
        }

        const soldVia = new SoldVia();
        soldVia.product = {};
        soldVia.service = {};
        
        const errors = await validator.validate(soldVia);
        expect(errors).to.include("serviceOrProduct");
    });
});
describe("exclusive or", async function () {
    it("should validate nested constraint", async function () {

        @ContextFor(`inv humanHairColors: self.color = "brown" or self.color = "blonde" 
            or self.color = "red" or self.color = "black"`)
        class Hair {
            color?: string;
        }

        class Human {
            @ValidateNested()
            hair?: Hair;
        }

        const stevieNicks = new Human();
        stevieNicks.hair = new Hair();
        stevieNicks.hair.color = "green";

        const errors = await validator.validate(stevieNicks);
        console.log(`my out: ${JSON.stringify(errors)}`);
        expect(errors.length).to.equal(1);

    });
});
