export interface UniappSkillConfig {
  name: string;
  description: string;
  sourceSkillDir: string;
  sourceTargetDir: string;
  distTargetDir: string;
}

export interface PrepareUniappSkillOptions {
  uniappRoot: string;
  skillDir: string;
  skillName?: string;
  description?: string;
  sourceSkillsDir?: string;
  instructionPath?: string;
  pageMetadataPath?: string;
}

export interface PatchUniappMpWeixinOptions {
  uniappRoot: string;
  distDir: string;
  skillName?: string;
  description?: string;
  sourceSkillsDir?: string;
  instructionPath?: string;
  pageMetadataPath?: string;
}

export interface UniappAdapterResult {
  skillName: string;
  sourceSkillDir: string;
  distSkillDir?: string;
  configPath?: string;
  appJsonPath?: string;
}
