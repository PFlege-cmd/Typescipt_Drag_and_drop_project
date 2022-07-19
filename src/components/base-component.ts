export default abstract class Component<T extends HTMLElement, U extends HTMLElement>{
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
