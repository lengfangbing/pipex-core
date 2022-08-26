/* eslint-disable no-undef */
import { createPipeCore } from '../src/core';

const _value = {
  name: 'pipe-core',
  age: 1,
  location: () => 'Asia',
  nick: {
    pipe: 1,
    core: 2
  },
  city: [1, 2, 3]
};

const customStartFunction = {
  getName (value: typeof _value) {
    return value.name;
  },
  getDoubleAge (value: typeof _value) {
    return value.age * 2;
  },
  getLocation (value: typeof _value) {
    return value.location();
  },
  getNick (value: typeof _value) {
    return value.nick;
  },
  getCity (value: typeof _value) {
    return value.city;
  },
  getValue (value: typeof _value) {
    return value;
  }
};

const sleep = async (time = 3000) => new Promise<void>(resolve => {
  setTimeout(() => resolve(), time);
});

test('test async process', async () => {
  const valueCore = createPipeCore({ ..._value }, customStartFunction);
  let a = 0;
  await valueCore
    .getName(async name => {
      a++;
      await sleep();
      return `changed ${name}`;
    })
    .pipe(name => {
      expect(a).toBe(1);
      a++;
      expect(name).toBe('changed pipe-core');
    })
    .getValue(value => {
      expect(a).toBe(2);
      const { location, ...val } = value;
      expect(val).toEqual({
        name: 'pipe-core',
        age: 1,
        nick: {
          pipe: 1,
          core: 2
        },
        city: [1, 2, 3]
      });
    })
    .pipeEnd();
});

test('test setValue process', async () => {
  const valueCore = createPipeCore({ ..._value }, customStartFunction);
  let a = 0;
  await valueCore
    .getName(async name => {
      a++;
      await sleep();
      return `changed ${name}`;
    })
    .pipe(name => {
      expect(a).toBe(1);
      a++;
      expect(name).toBe('changed pipe-core');
    })
    .getValue((value, _, set) => {
      expect(a).toBe(2);
      const { location, ...val } = value;
      expect(val).toEqual({
        name: 'pipe-core',
        age: 1,
        nick: {
          pipe: 1,
          core: 2
        },
        city: [1, 2, 3]
      });
      set({ age: 100, name: 'set age' });
    })
    .pipeEnd();

  await valueCore
    .getName(name => {
      expect(name).toBe('set age');
    })
    .getDoubleAge(age => {
      expect(age).toBe(200);
    })
    .pipe((_, __, set) => {
      set({ age: 1 });
    })
    .pipeEnd()
    .then(value => {
      const { location, ...val } = value;
      expect(val).toEqual({
        name: 'set age',
        age: 1,
        nick: {
          pipe: 1,
          core: 2
        },
        city: [1, 2, 3]
      });
    });
});

test('test empty value core', async () => {
  const valueCore = createPipeCore({ ..._value });

  await valueCore
    .pipeEnd()
    .then(value => {
      const { location, ...val } = value;
      expect(val).toEqual({
        name: 'pipe-core',
        age: 1,
        nick: {
          pipe: 1,
          core: 2
        },
        city: [1, 2, 3]
      });
    });
});

test('test use piece pipe core process', async () => {
  const valueCore = createPipeCore({ ..._value }, customStartFunction);
  // 计数器
  let count = 0;
  await valueCore
    .getName(name => {
      count++;
      expect(name).toBe('pipe-core');
      return name;
    })
    .pipe((name, piecePipe, set) => {
      expect(count).toBe(1);
      count++;
      set({ name: 'new pipe-core' });
      piecePipe
        .getName(() => {
          expect(count).toBe(2);
          count++;
        });
    })
    .getValue((_, piecePipe) => {
      expect(count).toBe(3);
      count++;
      piecePipe
        .getName(name => {
          expect(count).toBe(4);
          count++;
          expect(name).toBe('new pipe-core');
          return name;
        })
        .pipe((name, piecePipe) => {
          expect(count).toBe(5);
          count++;
          piecePipe
            .getName(_name => {
              expect(count).toBe(6);
              count++;
              return _name;
            })
            .pipe((_name, _, set) => {
              expect(count).toBe(7);
              count++;
              set({ name: 'pipe-core' });
            });
        });
    })
    .getName(name => {
      expect(count).toBe(8);
      count++;
      expect(name).toBe('pipe-core');
    })
    .pipeEnd()
    .then(value => {
      expect(count).toBe(9);
      const { location, ...rest } = value;
      expect(rest).toEqual({
        name: 'pipe-core',
        age: 1,
        nick: {
          pipe: 1,
          core: 2
        },
        city: [1, 2, 3]
      });
    });
});

test('test instance process process', async () => {
  const valueCore = createPipeCore({ ..._value }, customStartFunction);// 计数器
  let count = 0;
  async function instanceCaseWithoutNewValue () {
    await valueCore
      .instance()
      .getName(() => {
        expect(count).toBe(4);
        count++;
        return '123';
      })
      .pipe(name => {
        expect(count).toBe(5);
        count++;
        expect(name).toBe('123');
      })
      .getValue(async (_, piecePipe) => {
        expect(count).toBe(6);
        count++;
        await instanceCaseWithNewValue();
        piecePipe
          .getName(name => {
            expect(count).toBe(11);
            count++;
            expect(name).toBe('new pipe-core');
          });
      })
      .pipeEnd();
  }
  async function instanceCaseWithNewValue () {
    await valueCore
      .instance(true)
      .getName(() => {
        expect(count).toBe(7);
        count++;
        return '123';
      })
      .pipe(name => {
        expect(count).toBe(8);
        count++;
        expect(name).toBe('123');
      })
      .getValue((_, piecePipe) => {
        expect(count).toBe(9);
        count++;
        piecePipe
          .getName(name => {
            expect(count).toBe(10);
            count++;
            expect(name).toBe('pipe-core');
          });
      })
      .pipeEnd();
  }
  await valueCore
    .getName(name => {
      count++;
      expect(name).toBe('pipe-core');
      return name;
    })
    .pipe((name, piecePipe, set) => {
      expect(count).toBe(1);
      count++;
      set({ name: 'new pipe-core' });
      piecePipe
        .getName(() => {
          expect(count).toBe(2);
          count++;
        });
    })
    .getValue(async (_, piecePipe) => {
      expect(count).toBe(3);
      count++;
      await instanceCaseWithoutNewValue();
      piecePipe
        .getName(name => {
          expect(count).toBe(12);
          count++;
          expect(name).toBe('new pipe-core');
          return name;
        })
        .pipe((name, piecePipe) => {
          expect(count).toBe(13);
          count++;
          piecePipe
            .getName(_name => {
              expect(count).toBe(14);
              count++;
              return _name;
            })
            .pipe((_name, _, set) => {
              expect(count).toBe(15);
              count++;
              set({ name: 'pipe-core' });
            });
        });
    })
    .getName(name => {
      expect(count).toBe(16);
      count++;
      expect(name).toBe('pipe-core');
    })
    .pipeEnd()
    .then(value => {
      expect(count).toBe(17);
      const { location, ...rest } = value;
      expect(rest).toEqual({
        name: 'pipe-core',
        age: 1,
        nick: {
          pipe: 1,
          core: 2
        },
        city: [1, 2, 3]
      });
    });
});

test('test createPipeCore case', async () => {
  const valueCore = createPipeCore({ ..._value }, customStartFunction);

  await valueCore
    .getDoubleAge(doubleAge => {
      expect(doubleAge).toBe(2);
      return doubleAge / 2;
    })
    .pipe(divideAge => {
      expect(divideAge).toBe(1);
    })
    .getDoubleAge(doubleAge => {
      expect(doubleAge).toBe(2);
    })
    .getName(name => {
      expect(name).toBe('pipe-core');
    })
    .getName(name => {
      expect(name).toBe('pipe-core');
      return 'changed-pipe-core';
    })
    .pipe(changedName => {
      expect(changedName).toEqual('changed-pipe-core');
    })
    .getCity(city => {
      expect(city).toEqual([1, 2, 3]);
      return city.reverse();
    })
    .pipe((changedCity, _, update) => {
      expect(changedCity).toEqual([3, 2, 1]);
      update({ city: [3, 2, 1] });
    })
    .getCity(city => {
      return city;
    })
    .pipe(city => {
      expect(city).toEqual([3, 2, 1]);
    })
    .getLocation(location => {
      expect(location).toBe('Asia');
    })
    .pipe((val, _, update) => {
      expect(val).toBeUndefined();
      update({ location: () => 'Europe' });
    })
    .getNick(nick => {
      return {
        pipe: nick.core,
        core: nick.pipe
      };
    })
    .pipe((nick, _, update) => {
      expect(nick).toEqual({
        pipe: 2,
        core: 1
      });
      update({ nick: { pipe: 2, core: 1 } });
    })
    .pipeEnd()
    .then(val => {
      const { location, ...otherVal } = val;
      expect(location()).toBe('Europe');
      expect(otherVal).toEqual({
        name: 'pipe-core',
        age: 1,
        nick: {
          pipe: 2,
          core: 1
        },
        city: [3, 2, 1]
      });
    });
});

test('test use piecePipe and set', async () => {
  const value = {
    name: '@pipex/core',
    loading: false
  };
  const customStart = {
    getName (_value: typeof value) {
      return `custom returned ${_value.name}`;
    },
    getLoading (_value: typeof value) {
      return _value.loading;
    },
    getValue (_value: typeof value) {
      return _value;
    }
  };
  const pipeCore = createPipeCore(value, customStart);
  await pipeCore
    .getName((name, piecePipe) => {
      // name === 'custom returned @pipex/core'
      expect(name).toBe('custom returned @pipex/core');
      piecePipe
        .getLoading((loading, _, set) => {
          // loading === false
          expect(loading).toBe(false);
          // update loading value to true
          set({ loading: true });
        });
      return '123';
    })
    .pipe((name, piecePipe) => {
      // name === '123'
      expect(name).toBe('123');
      piecePipe
        .getLoading((loading, _, set) => {
          // loading === true
          expect(loading).toBe(true);
        });
    })
    .pipeEnd();
});

test('test use instance()', async () => {
  const value = {
    name: '@pipex/core',
    loading: false
  };
  const customStart = {
    getName (_value: typeof value) {
      return `custom returned ${_value.name}`;
    },
    getLoading (_value: typeof value) {
      return _value.loading;
    },
    getValue (_value: typeof value) {
      return _value;
    }
  };
  const pipeCore = createPipeCore(value, customStart);
  const testInstance = async () => {
    await pipeCore
      .instance()
      .getValue(async (_, __, set) => {
        // update loading to true
        set({ loading: true });
        await testNewInstance();
      })
      .pipeEnd();
  };
  const testNewInstance = async () => {
    await pipeCore
      .instance(true)
      .getValue((_, __, set) => {
        // update name
        set({ name: 'instance @pipex/core' });
      })
      .pipeEnd();
  };
  await pipeCore
    .getName((name, piecePipe) => {
      // name === 'custom returned @pipex/core'
      piecePipe
        .getLoading(async (loading, _piecePipe, set) => {
          // loading === false
          expect(loading).toBe(false);
          // update loading value to true
          await testInstance();
          _piecePipe
            .getName(_name => {
              // name === 'custom returned @pipex/core'，instance(true) will create one independent PipeCore, not reference value to source PipeCore
              expect(name).toBe('custom returned @pipex/core');
            })
            .getLoading(_loading => {
              // loading === true
              expect(_loading).toBe(true);
              // called instance before _piecePipe, so loading is true
            });
        });
    })
    .pipeEnd();
});

test('test instance() correct1', async () => {
  const value = {
    name: '@pipex/core',
    loading: false
  };
  const customStart = {
    getName (_value: typeof value) {
      return `custom returned ${_value.name}`;
    },
    getLoading (_value: typeof value) {
      return _value.loading;
    },
    getValue (_value: typeof value) {
      return _value;
    }
  };
  const pipeCore = createPipeCore(value, customStart);
  const newInstance = async () => {
    await pipeCore
      .instance(true)
      .getValue(_value => {
        expect(_value).toEqual({
          name: '@pipex/core',
          loading: false
        });
      })
      .pipeEnd();
  };
  const instance = async () => {
    await pipeCore
      .instance()
      .getValue(_value => {
        expect(_value).toEqual({
          name: 'change name @pipex/core',
          loading: false
        });
      })
      .pipeEnd();
  };
  await pipeCore
    .getValue(async (val, _, set) => {
      set({ name: 'change name @pipex/core' });
      await instance();
      await newInstance();
    })
    .pipeEnd();
});
