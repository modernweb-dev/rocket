export interface UpgradeFile {
  path: string;
  relPath: string;
  name: string;
  extName: string;
  updatedContent?: string;
  updatedPath?: string;
  updatedRelPath?: string;
  updatedName?: string;
}

export interface FolderRename {
  from: string;
  to: string;
  fromAbsolute?: string;
  toAbsolute?: string;
}

export interface upgrade {
  files: UpgradeFile[];
  folderRenames: FolderRename[];
}
