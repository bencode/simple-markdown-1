import React from 'react';
import styled from 'styled-components';

import { Subject, fromEvent } from 'rxjs';

import {
  concatMap,
  filter,
  map,
  takeUntil,
  throttleTime,
  finalize,
  tap
} from 'rxjs/operators';

const Block = styled.div`
  border: 1px solid red;
  color: #fff;
  background: red;
  height: 30px;
  width: 30px;
  position: absolute;
`

class App extends React.Component {

  constructor(props) {
    super(props);
    this.movableBlock = React.createRef();
  }

  get position() {
    const {left, top} = this.movableBlock.current.getBoundingClientRect();
    return {
      left,
      top
    }
  }

  set position({left, top}) {
    this.movableBlock.current.style.left = `${left}px`;
    this.movableBlock.current.style.top = `${top}px`;
  }

  drag$ = new Subject();

  onDragStart = (e) => {
    e.persist();
    this.drag$.next(e);
  }

  get movable() {
    return true;
  }

  componentDidMount() {
    this.drag$.pipe(
      filter(() => this.movable),
      tap(() => {
        console.log('开始移动')
      }),
      map(event => ({
        event
      })),
      concatMap(({event}) => 
        fromEvent(window, 'mousemove').pipe(
          throttleTime(50),
          map((moveEvent) => {
            return {
              left: moveEvent.clientX,
              top: moveEvent.clientY
            }
          }),
          takeUntil(fromEvent(window, 'mouseup')),
          finalize(() => {
            console.log('移动结束')
          })
        ))
    ).subscribe(position => {
      console.log(position);
      this.position = position;
    });
  }

  render() {
    return (
      <div>
        <Block ref={this.movableBlock}
          onDragStart={(e) => e.preventDefault()}
          onMouseDown={this.onDragStart}>
          rxjs test
        </Block>
      </div>
    );
  }
}

export default App;
