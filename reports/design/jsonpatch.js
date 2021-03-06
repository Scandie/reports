var indexOf = [].indexOf || function(item) {
                for (var i = 0, l = this.length; i < l; i++) {
                              if (i in this && this[i] === item) return i;
                          }
                return -1;
            },
          extend = function(child, parent) {
                        for (var key in parent) {
                                  if (hasProp.call(parent, key)) child[key] = parent[key];
                              }

                        function ctor() {
                                  this.constructor = child;
                              }
                        ctor.prototype = parent.prototype;
                        child.prototype = new ctor();
                        child.__super__ = parent.prototype;
                        return child;
                    },
          hasProp = {}.hasOwnProperty;
  var AddPatch, CopyPatch, InvalidPatchError, InvalidPointerError, JSONPatch, JSONPatchError, JSONPointer, MovePatch, PatchConflictError, PatchTestFailed, RemovePatch, ReplacePatch, TestPatch, _isEqual, accessorMatch, apply, compile, escapedSlash, escapedTilde, hasOwnProperty, isArray, isEqual, isObject, isString, operationMap, toString;
  toString = Object.prototype.toString;
  hasOwnProperty = Object.prototype.hasOwnProperty;
  isArray = function(obj) {
            return toString.call(obj) === '[object Array]';
        };
  isObject = function(obj) {
            return toString.call(obj) === '[object Object]';
        };
  isString = function(obj) {
            return toString.call(obj) === '[object String]';
        };
  _isEqual = function(a, b, stack) {
            var className, key, length, result, size;
            if (a === b) {
                      return a !== 0 || 1 / a === 1 / b;
                  }
            if (a === null || b === null) {
                      return a === b;
                  }
            className = toString.call(a);
            if (className !== toString.call(b)) {
                      return false;
                  }
            switch (className) {
                          case '[object String]':
                              String(a) === String(b);
                              break;
                          case '[object Number]':
                              a = +a;
                              b = +b;
                              if (a !== a) {
                                                b !== b;
                                            } else {
                                                if (a === 0) {
                                                              1 / a === 1 / b;
                                                          } else {
                                                              a === b;
                                                          }
                                                      }
                              break;
                          case '[object Boolean]':
                              +a === +b;
                      }
            if (typeof a !== 'object' || typeof b !== 'object') {
                      return false;
                  }
            length = stack.length;
            while (length--) {
                      if (stack[length] === a) {
                                    return true;
                                }
                  }
            stack.push(a);
            size = 0;
            result = true;
            if (className === '[object Array]') {
                      size = a.length;
                      result = size === b.length;
                      if (result) {
                                    while (size--) {
                                                  if (!(result = indexOf.call(a, size) >= 0 === indexOf.call(b, size) >= 0 && _isEqual(a[size], b[size], stack))) {
                                                                    break;
                                                                }
                                              }
                                }
                  } else {
                      if (indexOf.call(a, "constructor") >= 0 !== indexOf.call(b, "constructor") >= 0 || a.constructor !== b.constructor) {
                                    return false;
                                }
                                for (key in a) {
                                          if (hasOwnProperty.call(a, key)) {
                                                            size++;
                                                            if (!(result = hasOwnProperty.call(b, key) && _isEqual(a[key], b[key], stack))) {
                                                                          break;
                                                                      }
                                                        }
                                      }
                                if (result) {
                                          for (key in b) {
                                                            if (hasOwnProperty.call(b, key) && !size--) {
                                                                          break;
                                                                      }
                                                        }
                                          result = !size;
                                      }
                            }
            stack.pop();
            return result;
        };
  isEqual = function(a, b) {
            return _isEqual(a, b, []);
        };
  JSONPatchError = (function(superClass) {
            extend(JSONPatchError, superClass);

            function JSONPatchError(message) {
                      this.message = message != null ? message : 'JSON patch error';
                      this.name = 'JSONPatchError';
                  }

            return JSONPatchError;

        })(Error);
  InvalidPointerError = (function(superClass) {
            extend(InvalidPointerError, superClass);

            function InvalidPointerError(message) {
                      this.message = message != null ? message : 'Invalid pointer';
                      this.name = 'InvalidPointer';
                  }

            return InvalidPointerError;

        })(Error);
  InvalidPatchError = (function(superClass) {
            extend(InvalidPatchError, superClass);

            function InvalidPatchError(message) {
                      this.message = message != null ? message : 'Invalid patch';
                      this.name = 'InvalidPatch';
                  }

            return InvalidPatchError;

        })(JSONPatchError);
  PatchConflictError = (function(superClass) {
            extend(PatchConflictError, superClass);

            function PatchConflictError(message) {
                      this.message = message != null ? message : 'Patch conflict';
                      this.name = 'PatchConflictError';
                  }

            return PatchConflictError;

        })(JSONPatchError);
  PatchTestFailed = (function(superClass) {
            extend(PatchTestFailed, superClass);

            function PatchTestFailed(message) {
                      this.message = message != null ? message : 'Patch test failed';
                      this.name = 'PatchTestFailed';
                  }

            return PatchTestFailed;

        })(Error);
  escapedSlash = /~1/g;
  escapedTilde = /~0/g;
  accessorMatch = /^[-+]?\d+$/;
  JSONPointer = (function() {
            function JSONPointer(path) {
                      var i, j, len1, step, steps;
                      steps = [];
                      if (path && (steps = path.split('/')).shift() !== '') {
                                    throw new InvalidPointerError();
                                }
                      for (i = j = 0, len1 = steps.length; j < len1; i = ++j) {
                                    step = steps[i];
                                    steps[i] = step.replace(escapedSlash, '/').replace(escapedTilde, '~');
                                }
                      this.accessor = steps.pop();
                      this.steps = steps;
                      this.path = path;
                  }

            JSONPointer.prototype.getReference = function(parent) {
                      var j, len1, ref, step;
                      ref = this.steps;
                      for (j = 0, len1 = ref.length; j < len1; j++) {
                                    step = ref[j];
                                    if (isArray(parent)) {
                                                  step = parseInt(step, 10);
                                              }
                                    if (!(step in parent)) {
                                                  throw new PatchConflictError('Array location out of bounds or not an instance property');
                                              }
                                    parent = parent[step];
                                }
                      return parent;
                  };

            JSONPointer.prototype.coerce = function(reference, accessor) {
                      if (isArray(reference)) {
                                    if (isString(accessor)) {
                                                  if (accessor === '-') {
                                                                    accessor = reference.length;
                                                                } else if (accessorMatch.test(accessor)) {
                                                                    accessor = parseInt(accessor, 10);
                                                                } else {
                                                                    throw new InvalidPointerError('Invalid array index number');
                                                                }
                                              }
                                }
                      return accessor;
                  };

            return JSONPointer;

        })();
  JSONPatch = (function() {
            function JSONPatch(patch) {
                      if (!('path' in patch)) {
                                    throw new InvalidPatchError();
                                }
                      this.validate(patch);
                      this.patch = patch;
                      this.path = new JSONPointer(patch.path);
                      this.initialize(patch);
                  }

            JSONPatch.prototype.initialize = function() {};

            JSONPatch.prototype.validate = function(patch) {};

            JSONPatch.prototype.apply = function(document) {
                      throw new Error('Method not implemented');
                  };

            return JSONPatch;

        })();
  AddPatch = (function(superClass) {
            extend(AddPatch, superClass);

            function AddPatch() {
                      return AddPatch.__super__.constructor.apply(this, arguments);
                  }

            AddPatch.prototype.validate = function(patch) {
                      if (!('value' in patch)) {
                                    throw new InvalidPatchError();
                                }
                  };

            AddPatch.prototype.apply = function(document) {
                      var accessor, reference, value;
                      reference = this.path.getReference(document);
                      accessor = this.path.accessor;
                      value = this.patch.value;
                      if (isArray(reference)) {
                                    accessor = this.path.coerce(reference, accessor);
                                    if (accessor < 0 || accessor > reference.length) {
                                                  throw new PatchConflictError("Index " + accessor + " out of bounds");
                                              }
                                    reference.splice(accessor, 0, value);
                                } else if (accessor == null) {
                                    document = value;
                                } else {
                                    reference[accessor] = value;
                                }
                      return document;
                  };

            return AddPatch;

        })(JSONPatch);
  RemovePatch = (function(superClass) {
            extend(RemovePatch, superClass);

            function RemovePatch() {
                      return RemovePatch.__super__.constructor.apply(this, arguments);
                  }

            RemovePatch.prototype.apply = function(document) {
                      var accessor, reference;
                      reference = this.path.getReference(document);
                      accessor = this.path.accessor;
                      if (isArray(reference)) {
                                    accessor = this.path.coerce(reference, accessor);
                                    if (accessor >= reference.length) {
                                                  throw new PatchConflictError("Value at " + accessor + " does not exist");
                                              }
                                    reference.splice(accessor, 1);
                                } else {
                                    if (!(accessor in reference)) {
                                                  throw new PatchConflictError("Value at " + accessor + " does not exist");
                                              }
                                              delete reference[accessor];
                                          }
                      return document;
                  };

            return RemovePatch;

        })(JSONPatch);
  ReplacePatch = (function(superClass) {
            extend(ReplacePatch, superClass);

            function ReplacePatch() {
                      return ReplacePatch.__super__.constructor.apply(this, arguments);
                  }

            ReplacePatch.prototype.validate = function(patch) {
                      if (!('value' in patch)) {
                                    throw new InvalidPatchError();
                                }
                  };

            ReplacePatch.prototype.apply = function(document) {
                      var accessor, reference, value;
                      reference = this.path.getReference(document);
                      accessor = this.path.accessor;
                      value = this.patch.value;
                      if (accessor == null) {
                                    return value;
                                }
                      if (isArray(reference)) {
                                    accessor = this.path.coerce(reference, accessor);
                                    if (accessor >= reference.length) {
                                                  throw new PatchConflictError("Value at " + accessor + " does not exist");
                                              }
                                    reference.splice(accessor, 1, value);
                                } else {
                                    if (!(accessor in reference)) {
                                                  throw new PatchConflictError("Value at " + accessor + " does not exist");
                                              }
                                              reference[accessor] = value;
                                          }
                      return document;
                  };

            return ReplacePatch;

        })(JSONPatch);
  TestPatch = (function(superClass) {
            extend(TestPatch, superClass);

            function TestPatch() {
                      return TestPatch.__super__.constructor.apply(this, arguments);
                  }

            TestPatch.prototype.validate = function(patch) {
                      if (!('value' in patch)) {
                                    throw new InvalidPatchError("'value' member is required");
                                }
                  };

            TestPatch.prototype.apply = function(document) {
                      var accessor, reference, value;
                      reference = this.path.getReference(document);
                      accessor = this.path.accessor;
                      value = this.patch.value;
                      if (isArray(reference)) {
                                    accessor = this.path.coerce(reference, accessor);
                                }
                      if (!isEqual(reference[accessor], value)) {
                                    throw new PatchTestFailed();
                                }
                      return document;
                  };

            return TestPatch;

        })(JSONPatch);
  MovePatch = (function(superClass) {
            extend(MovePatch, superClass);

            function MovePatch() {
                      return MovePatch.__super__.constructor.apply(this, arguments);
                  }

            MovePatch.prototype.initialize = function(patch) {
                      var i, j, len, ref, within;
                      this.from = new JSONPointer(patch.from);
                      len = this.from.steps.length;
                      within = true;
                      for (i = j = 0, ref = len; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
                                    if (this.from.steps[i] !== this.path.steps[i]) {
                                                  within = false;
                                                  break;
                                              }
                                }
                      if (within) {
                                    if (this.path.steps.length !== len) {
                                                  throw new InvalidPatchError("'to' member cannot be a descendent of 'path'");
                                              }
                                    if (this.from.accessor === this.path.accessor) {
                                                  return this.apply = function(document) {
                                                                    return document;
                                                                };
                                              }
                                }
                  };

            MovePatch.prototype.validate = function(patch) {
                      if (!('from' in patch)) {
                                    throw new InvalidPatchError("'from' member is required");
                                }
                  };

            MovePatch.prototype.apply = function(document) {
                      var accessor, reference, value;
                      reference = this.from.getReference(document);
                      accessor = this.from.accessor;
                      if (isArray(reference)) {
                                    accessor = this.from.coerce(reference, accessor);
                                    if (accessor >= reference.length) {
                                                  throw new PatchConflictError("Value at " + accessor + " does not exist");
                                              }
                                    value = reference.splice(accessor, 1)[0];
                                } else {
                                    if (!(accessor in reference)) {
                                                  throw new PatchConflictError("Value at " + accessor + " does not exist");
                                              }
                                              value = reference[accessor];
                                              delete reference[accessor];
                                          }
                      reference = this.path.getReference(document);
                      accessor = this.path.accessor;
                      if (isArray(reference)) {
                                    accessor = this.path.coerce(reference, accessor);
                                    if (accessor < 0 || accessor > reference.length) {
                                                  throw new PatchConflictError("Index " + accessor + " out of bounds");
                                              }
                                    reference.splice(accessor, 0, value);
                                } else {
                                    if (accessor in reference) {
                                                  throw new PatchConflictError("Value at " + accessor + " exists");
                                              }
                                              reference[accessor] = value;
                                          }
                      return document;
                  };

            return MovePatch;

        })(JSONPatch);
  CopyPatch = (function(superClass) {
            extend(CopyPatch, superClass);

            function CopyPatch() {
                      return CopyPatch.__super__.constructor.apply(this, arguments);
                  }

            CopyPatch.prototype.apply = function(document) {
                      var accessor, reference, value;
                      reference = this.from.getReference(document);
                      accessor = this.from.accessor;
                      if (isArray(reference)) {
                                    accessor = this.from.coerce(reference, accessor);
                                    if (accessor >= reference.length) {
                                                  throw new PatchConflictError("Value at " + accessor + " does not exist");
                                              }
                                    value = reference.slice(accessor, accessor + 1)[0];
                                } else {
                                    if (!(accessor in reference)) {
                                                  throw new PatchConflictError("Value at " + accessor + " does not exist");
                                              }
                                              value = reference[accessor];
                                          }
                      reference = this.path.getReference(document);
                      accessor = this.path.accessor;
                      if (isArray(reference)) {
                                    accessor = this.path.coerce(reference, accessor);
                                    if (accessor < 0 || accessor > reference.length) {
                                                  throw new PatchConflictError("Index " + accessor + " out of bounds");
                                              }
                                    reference.splice(accessor, 0, value);
                                } else {
                                    if (accessor in reference) {
                                                  throw new PatchConflictError("Value at " + accessor + " exists");
                                              }
                                              reference[accessor] = value;
                                          }
                      return document;
                  };

            return CopyPatch;

        })(MovePatch);
  operationMap = {
            add: AddPatch,
            remove: RemovePatch,
            replace: ReplacePatch,
            move: MovePatch,
            copy: CopyPatch,
            test: TestPatch
        };
  compile = function(patch) {
            var j, klass, len1, ops, p;
            if (!isArray(patch)) {
                      if (isObject(patch)) {
                                    patch = [patch];
                                } else {
                                    throw new InvalidPatchError('patch must be an object or array');
                                }
                  }
            ops = [];
            for (j = 0, len1 = patch.length; j < len1; j++) {
                      p = patch[j];
                      if (!(klass = operationMap[p.op])) {
                                    throw new InvalidPatchError('invalid operation: ' + p.op);
                                }
                      ops.push(new klass(p));
                  }
            return function(document) {
                      var k, len2, op, result;
                      result = document;
                      for (k = 0, len2 = ops.length; k < len2; k++) {
                                    op = ops[k];
                                    result = op.apply(result);
                                }
                      return result;
                  };
        };
  apply = function(document, patch) {
            return compile(patch)(document);
        };
  exports.version = '0.7.0';
  exports.apply = apply;
  exports.compile = compile;
  exports.JSONPointer = JSONPointer;
  exports.JSONPatch = JSONPatch;
  exports.JSONPatchError = JSONPatchError;
  exports.InvalidPointerError = InvalidPointerError;
  exports.InvalidPatchError = InvalidPatchError;
  exports.PatchConflictError = PatchConflictError;
  exports.PatchTestFailed = PatchTestFailed;