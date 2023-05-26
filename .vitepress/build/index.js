const type = 'dev'
// const type = 'build'
export function Build(){
    return type === 'build' ? '/blog' : ''
}
