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
    const exclusiveConstraint = `inv catsMeowDogsBark: (self.kind = "cat" and self.sound = "meow")
            xor (self.kind = "dog" and self.sound = "bark")`;
    it("should validate successfully on exclusive constraint", async function () {

        @ContextFor(exclusiveConstraint)
        class Pet {
            kind?: string;
            sound?: string;
        }

        const pet = new Pet();
        pet.kind = "cat"
        pet.sound = "meow";

        const errors = await validator.validate(pet);
        expect(errors.length).to.equal(0);
    });
    it("should validate successfully on exclusive constraint", async function () {

        @ContextFor(exclusiveConstraint)
        class Pet {
            kind?: string;
            sound?: string;
        }

        const pet = new Pet();
        pet.kind = "dog"
        pet.sound = "meow";

        const errors = await validator.validate(pet);
        expect(errors).to.include("catsMeowDogsBark");
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
        expect(errors.length).to.equal(1);

    });
});
