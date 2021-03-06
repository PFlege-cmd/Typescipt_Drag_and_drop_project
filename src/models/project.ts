
// Project class

import { ProjectStatus } from '../components/project-status';

export class Project{
    constructor(
        public id: number,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ){}
}
