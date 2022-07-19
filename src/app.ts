import { ProjectInput } from './components/project-input.js';
import { ProjectList } from './components/project-list.js';
import { validate } from './util/validation.js';


const projectInput: ProjectInput = new ProjectInput();
new ProjectList('active');
new ProjectList('finished')
console.log(validate(projectInput));

