// bind to class-instance
function Autobind(_target: any, _description: string, properties: PropertyDescriptor): PropertyDescriptor{
    
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

    function TitleValid(target: any, 
        propName: string){
        validator[target.constructor.name] = {
            ...validator[target.constructor.name],
            [propName]: [
                ...validator?.[target.constructor.name]?.[propName] ?? [],
                'title_valid']
        }
    }

    function DescriptionValid(target: any,
        propName: string){
            validator[target.constructor.name] = {
                ...validator[target.constructor.name],
                [propName]: [
                    ...validator?.[target.constructor.name]?.[propName] ?? [],
                'description_valid']
            }
        }

    function PeopleValid(target: any,
        propName: string){
            validator[target.constructor.name] = {
                ...validator[target.constructor.name],
                [propName]: [...validator?.[target.constructor.name]?.[propName] ?? [],'people_valid']
            }
        }

        function MinLength(minLength: number){
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

function validate(obj: any){
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

// Enum

enum ProjectStatus {
    ACTIVE,
    FINISHED
}

// Project class

class Project{
    constructor(
        public id: number,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ){}
}

// Listener function

type Listener = (project: Project[]) => void;

// Global state management

class ProjectState{

    projectList: Project[] = [];
    listeners: Listener[] = [];

    static instance: ProjectState;

    static getInstance(){
        if (!this.instance){
            this.instance = new ProjectState();
        }
        return this.instance;
    }

    private constructor(){

    }

    addProject(
        title: string,
        description: string,
        people: number
    ){
        const newProject = new Project(
            Math.random(), title, description, people, ProjectStatus.ACTIVE
        );

        this.projectList.push(newProject);
        console.log(this.projectList)
            for (const func of this.listeners){
                func(this.projectList.slice());
            }

    }

    addListener(listener: Listener){
        this.listeners.push(listener);
    }
}

const projectState: ProjectState = ProjectState.getInstance();

// Base class

abstract class Component<T extends HTMLElement, U extends HTMLElement>{
    templateElement: HTMLTemplateElement;
    element: T;
    targetElement: U;

    constructor(
                public attachBefore: boolean,
                public templateId: string,
                public targetElementId: string,
                public elementId?:string){
        this.templateElement = document.getElementById(templateId) as HTMLTemplateElement;
        console.log(`target-element id is: ${targetElementId}`)
        this.targetElement = document.getElementById(targetElementId) as U;
        console.log(`target is in super: ${this.targetElement}`);

        let importedFromTemplate: DocumentFragment = document.importNode(this.templateElement.content, true);
        this.element = importedFromTemplate.firstElementChild as T;
        if (elementId){
            this.element.id = elementId;
        }
    }

    abstract configure(): void;
    abstract renderContent(): void;
    protected attach(elementToAttach: HTMLElement, elementToAttachTo: HTMLElement){
        elementToAttachTo?.insertAdjacentElement(this.attachBefore?'afterbegin':'beforeend', elementToAttach);
    }
}

// Project List

class ProjectList extends Component<HTMLElement, HTMLDivElement> {

    assignedProjects: Project[] = [];

    constructor(private type: 'active'|'finished'){
        super(false, 'project-list', 'app', `${type}-projects`)

        console.log(`${this.element} is not null?`)
        console.log(`${this.targetElement} is a target?`)

        this.configure();
        this.renderContent();
        this.attach(this.element, this.targetElement)
    }

    renderContent(){
        this.element.querySelector('ul')!.id = `${ this.type }-projects-list`;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() +  ' PROJECTS';
    }

    configure() {
        projectState.addListener((projects: Project[]) => {
            if (this.type ==='active'){
                this.assignedProjects = projects.filter(project => {
                    return project.status === ProjectStatus.ACTIVE
                })
            } else {
                this.assignedProjects = projects.filter(project => {
                    return project.status === ProjectStatus.FINISHED;
                });
            }
            this.renderProjects();
        })
    }

    private renderProjects(){
       const listEl = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
       listEl.innerHTML = '';
       for (const project of this.assignedProjects){
           const newProject: ProjectItem = new ProjectItem(project, `${this.type}-projects-list`);
       }
    }
}

// Project inputs
class ProjectInput extends Component<HTMLFormElement, HTMLDivElement> {
    @TitleValid
    titleFormElement: HTMLInputElement;
    @DescriptionValid
    @MinLength(2)
    descriptionFormElement: HTMLInputElement;
    @PeopleValid
    peopleFormElement: HTMLInputElement

    constructor(){
        super(true,'project-input','app', 'user-input')
        this.titleFormElement = this.element.querySelector('#title')!;
        this.descriptionFormElement = this.element.querySelector('#description')!;
        this.peopleFormElement = this.element.querySelector('#people')!;

        this.configure()
        this.attach(this.targetElement, this.element)
    }

    renderContent(): void {
        console.log("Empty method");
    }

    attach(elementToAttachTo: HTMLElement, elementToAttach: HTMLElement){
        elementToAttachTo.insertAdjacentElement('afterbegin', elementToAttach);
    }

    @Autobind
    private submitValue(event: Event){
        event.preventDefault();

       if(!validate(this)){
            alert('Invalid Input');
       } else {
            alert('Beautifully input values');
            const title = this.titleFormElement.value;
            const description = this.descriptionFormElement.value;
            const people = +this.peopleFormElement.value;

           projectState.addProject(title, description, people)
           this.resetUserInputs();
       }
    }

    private resetUserInputs(){
        this.titleFormElement.value = '';
        this.descriptionFormElement.value = '';
        this.peopleFormElement.value = '';
    }

    configure(){
        this.element.addEventListener('submit', this.submitValue)
    }
}

class ProjectItem extends Component<HTMLLIElement, HTMLUListElement> {

    project: Project;

    constructor(project: Project, targetId: string){
        super(false, 'single-project', targetId, project.id.toString())
        this.project = project;
        this.renderContent();
    }


    configure(): void {
    }

    renderContent(): void {
        const titleH3: HTMLHeadElement = this.element.querySelector('h3')!;
        titleH3.textContent = this.project.title;

        const descriptionH2: HTMLHeadElement = this.element.querySelector('h2')!
        descriptionH2.textContent = this.project.description;

        const peopleParagraph: HTMLParagraphElement = this.element.querySelector('p')!;
        peopleParagraph.textContent = this.project.people.toString();
        this.attach(this.element, this.targetElement);
    }
}

const projectInput: ProjectInput = new ProjectInput();
const projectListActive: ProjectList = new ProjectList('active');
const projectListFinished: ProjectList = new ProjectList('finished')
console.log(validate(projectInput));
