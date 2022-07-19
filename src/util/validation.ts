export function Autobind(_target: any, _description: string, properties: PropertyDescriptor): PropertyDescriptor{

    const methodInvocation = properties.value;
    return {
        enumerable: false,
        configurable: true,
        get(){
            return methodInvocation.bind(this)
        }
    }
}

// validate userInput

interface ValidationConfig{
    [classDescription: string]:{
        [formField: string]: (string  | [string, number])[],
    }
}

let validator: ValidationConfig = {}

export function TitleValid(target: any,
                    propName: string){
    validator[target.constructor.name] = {
        ...validator[target.constructor.name],
        [propName]: [
            ...validator?.[target.constructor.name]?.[propName] ?? [],
            'title_valid']
    }
}

export function DescriptionValid(target: any,
                          propName: string){
    validator[target.constructor.name] = {
        ...validator[target.constructor.name],
        [propName]: [
            ...validator?.[target.constructor.name]?.[propName] ?? [],
            'description_valid']
    }
}

export function PeopleValid(target: any,
                     propName: string){
    validator[target.constructor.name] = {
        ...validator[target.constructor.name],
        [propName]: [...validator?.[target.constructor.name]?.[propName] ?? [],'people_valid']
    }
}

export function MinLength(minLength: number){
    console.log(`Minlength is: ${minLength}`);
    return function(target:any, propName: string){
        validator[target.constructor.name] = {
            ...validator[target.constructor.name],
            [propName]: [
                ...validator?.[target.constructor.name]?.[propName] ?? [],
                ['min_length', minLength]]
        };
    }
}

export function validate(obj: any){
    console.log(obj.constructor.name);
    const validatorInfo = validator[obj.constructor.name];
    console.log(validator);
    let isValid = true;
    for (const field in validatorInfo){
        console.log(field);
        console.log(validatorInfo[field])
        const validationType = validatorInfo[field];
        console.log(obj[field])
        for (const property of validationType){
            console.log(property);
            switch(property){
                case 'title_valid':
                case 'description_valid':
                    isValid = isValid && obj[field].value.length > 0;
                    break;
                case 'people_valid':
                    isValid = isValid && +obj[field].value > 0;
                    break;
                default:
                    if (property.length === 2 && property[0] === 'min_length'){
                        console.log(`Minlength is : ${property[1]}`)
                        isValid = isValid && (obj[field].value + '').trim().length >= property[1];
                        break
                    }
                    isValid = false;
                    break;


            }
        }
    }
    return isValid;
}
