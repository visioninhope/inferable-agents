rm -rf sdk-node
git clone git@github.com:inferablehq/inferable-node.git sdk-node
rm -rf sdk-node/.git
mv sdk-node/.github workflows/
rm -rf sdk-node/.editorconfig

rm -rf sdk-go
git clone git@github.com:inferablehq/inferable-go.git sdk-go
rm -rf sdk-go/.git
mv sdk-go/.github workflows/
rm -rf sdk-go/.editorconfig

rm -rf sdk-bash
git clone git@github.com:inferablehq/inferable-bash.git sdk-bash
rm -rf sdk-bash/.git
mv sdk-bash/.github workflows/
rm -rf sdk-bash/.editorconfig

rm -rf sdk-dotnet
git clone git@github.com:inferablehq/inferable-dotnet.git sdk-dotnet
rm -rf sdk-dotnet/.git
mv sdk-dotnet/.github workflows/
rm -rf sdk-dotnet/.editorconfig
