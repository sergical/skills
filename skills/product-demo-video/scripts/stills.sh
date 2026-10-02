#!/bin/zsh
# Renders frames of a composition at half scale and tiles them 2 across into one contact sheet.
# Usage: stills.sh <project-dir> <composition-id> <sheet-name> <frame>...
# Bundles once into <project>/out/bundle. Set REBUNDLE=1 after code edits.
set -e
project=${1:A}; id=$2; name=$3; shift 3
bundle=$project/out/bundle
work=$project/out/stills
cd $project
if [[ ! -d $bundle || -n $REBUNDLE ]]; then
  npx remotion bundle --out-dir=$bundle --log=error
fi
rm -rf $work && mkdir -p $work
inputs=()
for f in "$@"; do
  npx remotion still $bundle $id $work/$f.png --frame=$f --scale=0.5 --log=error
  inputs+=(-i $work/$f.png)
done
n=$#
if (( n == 1 )); then
  cp $work/$1.png $project/out/$name.png
else
  layout=$(python3 -c "print('|'.join(f'{(i%2)*960}_{(i//2)*540}' for i in range($#)))")
  ffmpeg -loglevel error -y "${inputs[@]}" -filter_complex "xstack=inputs=${n}:layout=${layout}:fill=black" $project/out/$name.png
fi
echo $project/out/$name.png
