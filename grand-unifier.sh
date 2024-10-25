rm -rf sdk-node
git clone git@github.com:inferablehq/inferable-node.git sdk-node
rm -rf sdk-node/.git
mkdir -p workflows/node
mv sdk-node/.github workflows/node/
rm -rf sdk-node/.editorconfig

rm -rf sdk-go
git clone git@github.com:inferablehq/inferable-go.git sdk-go
rm -rf sdk-go/.git
mkdir -p workflows/go
mv sdk-go/.github workflows/go/
mv sdk-go/.github workflows/
rm -rf sdk-go/.editorconfig

rm -rf sdk-bash
git clone git@github.com:inferablehq/inferable-bash.git sdk-bash
rm -rf sdk-bash/.git
mkdir -p workflows/bash
mv sdk-bash/.github workflows/bash/
mv sdk-bash/.github workflows/
rm -rf sdk-bash/.editorconfig

rm -rf sdk-dotnet
git clone git@github.com:inferablehq/inferable-dotnet.git sdk-dotnet
rm -rf sdk-dotnet/.git
mkdir -p workflows/dotnet
mv sdk-dotnet/.github workflows/dotnet/
rm -rf sdk-dotnet/.editorconfig
