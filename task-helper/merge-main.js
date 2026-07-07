import fs from 'node:fs';
import path from 'node:path';

const TASKS_DIR = path.join(process.cwd(), '../tasks');
const MAIN_DIR = path.join(TASKS_DIR, 'main');

function updateTasksFromMain() {
  if (!fs.existsSync(MAIN_DIR)) {
    console.error('Error: tasks/main directory does not exist.');
    process.exit(1);
  }

  const mainLanguages = fs.readdirSync(MAIN_DIR).filter(file =>
    fs.statSync(path.join(MAIN_DIR, file)).isDirectory()
  );

  const tasks = fs.readdirSync(TASKS_DIR).filter(file =>
    file !== 'main' && fs.statSync(path.join(TASKS_DIR, file)).isDirectory()
  );

  if (tasks.length === 0) {
    console.log('No existing tasks found to update.');
    return;
  }

  for (const task of tasks) {
    for (const language of mainLanguages) {
      const targetLangDir = path.join(TASKS_DIR, task, language);
      const mainLangDir = path.join(MAIN_DIR, language);

      if (fs.existsSync(targetLangDir)) {
        console.log(`Updating ${task}/${language} from main...`);
        fs.cpSync(mainLangDir, targetLangDir, { recursive: true, force: true });
      }
    }
  }

  console.log('Finished updating tasks.');
}

updateTasksFromMain();