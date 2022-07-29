import { Settings } from './../../helpers/SettingsHelper';
import { Dashboard } from '../../commands/Dashboard';
import { ExplorerView } from '../../explorerView/ExplorerView';
import { Extension, Logger } from '../../helpers';
import { GeneralCommands } from './../../constants/GeneralCommands';
import simpleGit, { SimpleGit } from 'simple-git';
import { SETTING_GIT_COMMIT_MSG } from '../../constants';
import { Folders } from '../../commands/Folders';

export class GitListener {
  private static client: SimpleGit | null = null;

  /**
   * Process the messages
   * @param msg 
   */
  public static process(msg: { command: string, data: any }) {
    switch(msg.command) {
      case GeneralCommands.toVSCode.gitSync:
        this.sync();   
        break;
    }
  }

  public static async sync() {
    try {
      this.sendMsg(GeneralCommands.toWebview.gitSyncingStart, {});

      await this.pull();
      await this.push();
    
      this.sendMsg(GeneralCommands.toWebview.gitSyncingEnd, {});
    } catch (e) {
      Logger.error((e as Error).message);
      this.sendMsg(GeneralCommands.toWebview.gitSyncingEnd, {});
    }
  }

  public static async isGitRepository() {
    const git = this.getClient();
    if (!git) {
      return false;
    }

    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      Logger.warning(`Current workspace is not a GIT repository`);
    }

    return isRepo;
  }

  private static async pull() {
    const git = this.getClient();
    if (!git) {
      return;
    }

    Logger.info(`Pulling from remote`);
    await git.pull();
  }

  private static async push() {
    const commitMsg = Settings.get<string>(SETTING_GIT_COMMIT_MSG);

    const git = this.getClient();
    if (!git) {
      return;
    }

    Logger.info(`Pushing to remote`);

    const status = await git.status();

    for (const file of status.not_added) {
      await git.add(file);
    }
    for (const file of status.modified) {
      await git.add(file);
    }

    await git.commit(commitMsg || "Synced by Front Matter")

    await git.push();
  }

  private static getClient() {
    const wsFolder = Folders.getWorkspaceFolder();

    const options = {
      baseDir: wsFolder?.fsPath || "",
      binary: 'git',
      maxConcurrentProcesses: 6,
    }

    return simpleGit(options);
  }

  private static sendMsg(command: string, data: any) {

    const extPath = Extension.getInstance().extensionPath;
    const panel = ExplorerView.getInstance(extPath);

    panel.sendMessage({ command: command as any, data });

    Dashboard.postWebviewMessage({ command: command as any, data });
  }
}