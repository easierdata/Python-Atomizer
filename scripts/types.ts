export interface ImportStatement {
    type: 'Import' | 'ImportFrom';
    names: string[];
    module?: string;
}

export interface importElement {
    type: string;
    module: string | undefined;
    names: string[]
}