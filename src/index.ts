import OclEngine from "@stekoe/ocl.js";

const ocl = new OclEngine();

ocl.addOclExpression(`
    context Person
        inv: self.name->isNotEmpty()
`);

ocl.evaluate({});