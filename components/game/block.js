function findBlockRefPoint(blockArray) {
  let refPoint = null;
  for (let x = 0; x < widthBlockCount; x++) {
    for (let y = 0; y < heightBlockCount; y++) {
      if (blockArray[x][y].isExist) {
        refPoint = {
          x: x,
          y: y,
        };
        break;
      }
    }
    if (refPoint != null) break;
  }
  return refPoint;
}

function getLotatedBlock(
  rotationBlueprint,
  currentRotateDirection,
  controlBlockArray
) {
  let tmpArray = copyBlockArray(controlBlockArray);
  let refPoint = findBlockRefPoint(tmpArray);
  clearBlockArray(tmpArray);

  if (rotationBlueprint.length == 0) {
    return null;
  }

  let r = rotationBlueprint[currentRotateDirection];
  for (let i = 0; i < r.length; i++) {
    let rotatedX = refPoint.x + r[i][0];
    let rotatedY = refPoint.y + r[i][1];

    if (
      rotatedX >= 0 &&
      rotatedX < widthBlockCount &&
      rotatedY >= 0 &&
      rotatedY < heightBlockCount
    ) {
      tmpArray[rotatedX][rotatedY].isExist = true;
    } else {
      return null;
    }
  }

  return tmpArray;
}

function getNextRotateDirection(currentRotateDirection, rotationAmount) {
  let nextRotationDirection = currentRotateDirection + 1;
  if (nextRotationDirection < rotationAmount) {
    return nextRotationDirection;
  } else {
    return 0;
  }
}

class ControlBlock {
  constructor() {
    this.currentRotateDirection = 0;
    this.initBlockTypes();
    this.makeRandomType();
    this.blockArray = new Array(widthBlockCount);
    initBlockArray(this.blockArray);
  }

  initBlockTypes() {
    this.blockTypeOne = new BlockTypeOne();
    this.blockTypeTwo = new BlockTypeTwo();
    this.blockTypeThree = new BlockTypeThree();
    this.blockTypeFour = new BlockTypeFour();
    this.blockTypeFive = new BlockTypeFive();
    this.blockTypeSix = new BlockTypeSix();
    this.blockTypeSeven = new BlockTypeSeven();
  }

  makeRandomType() {
    this.currentRotateDirection = 0;
    let randomNum = Math.floor(Math.random() * 7);

    switch (randomNum) {
      case 0:
        this.blockType = this.blockTypeOne;
        break;
      case 1:
        this.blockType = this.blockTypeTwo;
        break;
      case 2:
        this.blockType = this.blockTypeThree;
        break;
      case 3:
        this.blockType = this.blockTypeFour;
        break;
      case 4:
        this.blockType = this.blockTypeFive;
        break;
      case 5:
        this.blockType = this.blockTypeSix;
        break;
      case 6:
        this.blockType = this.blockTypeSeven;
        break;
    }
  }

  addNewControlBlock() {
    clearBlockArray(this.blockArray);

    let shape = this.blockType.shape;
    for (let i = 0; i < shape.length; i++) {
      this.blockArray[shape[i][0]][shape[i][1]].isExist = true;
    }
  }

  rotateBlock(
    controlBlock,
    controlBlockArray,
    stackedBlockArray,
    allowableRange
  ) {
    let rotatedBlockArray = getLotatedBlock(
      this.blockType.rotationBlueprint,
      this.currentRotateDirection,
      controlBlockArray
    );

    if (rotatedBlockArray == null) {
      if (allowableRange > 0) {
        let couldLeftRotate = this.checkLeftMoveRotation(
          controlBlock,
          controlBlockArray,
          stackedBlockArray,
          allowableRange
        );

        if (couldLeftRotate) {
          return true;
        } else {
          return this.checkRightMoveRotation(
            controlBlock,
            controlBlockArray,
            stackedBlockArray,
            allowableRange
          );
        }
      } else {
        return false;
      }
    }

    if (!isOverlaped(rotatedBlockArray, stackedBlockArray)) {
      this.currentRotateDirection = getNextRotateDirection(
        this.currentRotateDirection,
        this.blockType.rotationBlueprint.length
      );
      controlBlock.blockArray = rotatedBlockArray;
      return true;
    } else {
      return false;
    }
  }

  checkLeftMoveRotation(
    controlBlock,
    controlBlockArray,
    stackedBlockArray,
    allowableRange
  ) {
    let tmpArray = copyBlockArray(controlBlockArray);
    if (couldBlockMoveToLeft(tmpArray, stackedBlockArray)) {
      moveToLeftOneLine(tmpArray);

      return this.rotateBlock(
        controlBlock,
        tmpArray,
        stackedBlockArray,
        allowableRange - 1
      );
    }
  }

  checkRightMoveRotation(
    controlBlock,
    controlBlockArray,
    stackedBlockArray,
    allowableRange
  ) {
    let tmpArray = copyBlockArray(controlBlockArray);
    if (couldBlockMoveToRight(tmpArray, stackedBlockArray)) {
      moveToRightOneLine(tmpArray);

      return this.rotateBlock(
        controlBlock,
        tmpArray,
        stackedBlockArray,
        allowableRange - 1
      );
    }
  }

  removeControlBlock() {
    clearBlockArray(this.blockArray);
  }
}

class StakedBlock {
  constructor() {
    this.blockArray = new Array(widthBlockCount);
    initBlockArray(this.blockArray);
  }
}

function initBlockArray(blockArray) {
  for (let x = 0; x < widthBlockCount; x++) {
    blockArray[x] = new Array(heightBlockCount);
    for(let y = 0; y < heightBlockCount; y++) {
      blockArray[x][y] = {
        isExist : false
      };
    }
  }

  clearBlockArray(blockArray);
}

function moveToBottomOneLine(blockArray) {
  for (let x = 0; x < widthBlockCount; x++) {
    for (let y = heightBlockCount - 1; y != 0; y--) {
      copySingleBlock(blockArray[x][y], blockArray[x][y - 1]);
    }
    blockArray[x][0].isExist = false;
  }
}

function moveToLeftOneLine(blockArray) {
  for (let y = 0; y < heightBlockCount; y++) {
    for (let x = 0; x < widthBlockCount - 1; x++) {
      copySingleBlock(blockArray[x][y], blockArray[x + 1][y]);
    }
    blockArray[widthBlockCount - 1][y].isExist = false;
  }
}

function moveToRightOneLine(blockArray) {
  for (let y = 0; y < heightBlockCount; y++) {
    for (let x = widthBlockCount - 1; x != 0; x--) {
      copySingleBlock(blockArray[x][y], blockArray[x - 1][y]);
    }
    blockArray[0][y].isExist = false;
  }
}

function couldBlockMoveToBottom(controlBlocks, stackedBlocks) {
  let collisionCheckTmpArray = copyBlockArray(controlBlocks);

  let isBlockReachToBottomSide = isBlockReachedToBottomBorder(controlBlocks);
  let isBottomCollided = isBottomSideCollided(
    collisionCheckTmpArray,
    stackedBlocks
  );

  if (isBlockReachToBottomSide || isBottomCollided) {
    return false;
  }

  return true;
}

function couldBlockMoveToLeft(controlBlocks, stackedBlocks) {
  let collisionCheckTmpArray = copyBlockArray(controlBlocks);

  let isBlockReachToLeftSide = isBlockReachedToLeftBorder(controlBlocks);
  let isLeftCollided = isLeftSideCollided(
    collisionCheckTmpArray,
    stackedBlocks
  );

  if (isBlockReachToLeftSide || isLeftCollided) {
    return false;
  }

  return true;
}

function couldBlockMoveToRight(controlBlocks, stackedBlocks) {
  let collisionCheckTmpArray = copyBlockArray(controlBlocks);

  let isBlockReachToRightSide = isBlockReachedToRightBorder(controlBlocks);
  let isRightCollided = isRightSideCollided(
    collisionCheckTmpArray,
    stackedBlocks
  );

  if (isBlockReachToRightSide || isRightCollided) {
    return false;
  }

  return true;
}

function isBottomSideCollided(blockArray1, blockArray2) {
  moveToBottomOneLine(blockArray1);

  return isOverlaped(blockArray1, blockArray2);
}

function isLeftSideCollided(blockArray1, blockArray2) {
  moveToLeftOneLine(blockArray1);

  return isOverlaped(blockArray1, blockArray2);
}

function isRightSideCollided(blockArray1, blockArray2) {
  moveToRightOneLine(blockArray1);

  return isOverlaped(blockArray1, blockArray2);
}

function isOverlaped(blockArray1, blockArray2) {
  for (let x = 0; x < widthBlockCount; x++) {
    for (let y = 0; y < heightBlockCount; y++) {
      if (blockArray1[x][y].isExist && blockArray2[x][y].isExist) {
        return true;
      }
    }
  }

  return false;
}

function isBlockReachedToBottomBorder(blockArray) {
  for (let x = 0; x < widthBlockCount; x++) {
    if (blockArray[x][heightBlockCount - 1].isExist) {
      return true;
    }
  }
  return false;
}

function isBlockReachedToLeftBorder(blockArray) {
  for (let y = 0; y < heightBlockCount; y++) {
    if (blockArray[0][y].isExist) {
      return true;
    }
  }

  return false;
}

function isBlockReachedToRightBorder(blockArray) {
  for (let y = 0; y < heightBlockCount; y++) {
    if (blockArray[widthBlockCount - 1][y].isExist) {
      return true;
    }
  }
  return false;
}

function clearBlockArray(blockArray) {
  for (let x = 0; x < widthBlockCount; x++) {
    for (let y = 0; y < heightBlockCount; y++) {
      blockArray[x][y].isExist = false;
    }
  }
}

function copyBlockArray(blockArray) {
  let tmpArray = new Array(widthBlockCount);
  initBlockArray(tmpArray);
  for (let x = 0; x < widthBlockCount; x++) {
    for (let y = 0; y < heightBlockCount; y++) {
      copySingleBlock(tmpArray[x][y], blockArray[x][y]);
    }
  }
  return tmpArray;
}


function copySingleBlock(blockTo, blockFrom) {
  blockTo.isExist = blockFrom.isExist;
}