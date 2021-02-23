
export async function createImportMapForLocalPackages(packages) {
  for (const pkg of packages) {
    const pkgJson = await import(pkg);
    console.log({pkg, pkgJson});
  }
}
