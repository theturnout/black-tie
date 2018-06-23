# black-tie

A formal approach to semantic validation

## What is this?

black-tie is a simple, decorator based approach for semantic validation of TypeScript classes. Black-tie uses the `Object Constraint Language` to perform these validations.

## Invariants

Suppose we have a class that looks like this:

```typescript
class MediaItem {
    name: string;
    mediaType: 'book' | 'movie';
    isbn: string;
}
```

We want to enforce the rule that any book should have an ISBN number.

```typescript
@ContextFor(`inv bookHasIsbn: self.mediaType = "book" implies not self.isbn.oclIsUndefined()`)
class MediaItem {
    name: string;
    mediaType: 'book' | 'movie';
    isbn: string;
}

const myFavoriteBook: MediaItem = {
    name: "Adventures of Huckleberry Finn",
    mediaType: "book",
    isbn: "9781101628270"
}

const errors = await validator.validate(myFavoriteBook);
// no errors will be returned
```

## Validating nested objects

If your object contains nested objects and you want the validator to perform their validation too, then you need to
use the `@ValidateNested()` decorator:

```typescript
export class Post {
    @ValidateNested()
    user: User;
}
```

## Roadmap

- Support for preconditions and postconditions.
- Integration with `class-validator`.