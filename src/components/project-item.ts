import { Draggable } from '../models/drag-and-drop';
import { Project } from '../models/project';
import { Autobind } from '../util/validation';
import BaseComponent from './base-component';

export class ProjectItem extends BaseComponent<HTMLLIElement, HTMLUListElement> implements Draggable{

    project: Project;

    get persons(){
        if (this.project.people === 1)
            return this.project.people + ' person assigned'

        return this.project.people + ' persons assigned'
    }

    @Autobind
    dragStartHandler(event: DragEvent): void {
        event.dataTransfer!.setData('text/plain', this.element.id);
        event.dataTransfer!.effectAllowed= 'move';
    }


    dragEndHandler(_event: DragEvent): void {
        console.log("Dragend")
    }

    constructor(project: Project, targetId: string){
        super(false, 'single-project', targetId, project.id.toString())
        this.project = project;
        this.renderContent();
        this.configure();
    }



    configure(): void {
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    }

    renderContent(): void {
        this.element.querySelector('h3')!.textContent = this.project.title;
        this.element.querySelector('h2')!.textContent = this.project.description;
        this.element.querySelector('p')!.textContent = this.persons;

        this.attach(this.element, this.targetElement);
    }
}
