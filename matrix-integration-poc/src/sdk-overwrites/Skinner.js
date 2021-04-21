import * as idx from "../component-index";

class Skinner {
  constructor() {
    this.components = null;
  }

  getComponent(name) {
    const doLookup = (components) => {
      if (!components) return null;
      let comp = components[name];
      // XXX: Temporarily also try 'views.' as we're currently
      // leaving the 'views.' off views.
      if (!comp) {
        comp = components["views." + name];
      }
      return comp;
    };

    // Check the skin first
    const comp = doLookup(this.components);

    // Just return nothing instead of erroring - the consumer should be smart enough to
    // handle this at this point.
    if (!comp) {
      return null;
    }

    // components have to be functions or forwardRef objects with a render function.
    const validType = typeof comp === "function" || comp.render;
    if (!validType) {
      throw new Error(
        `Not a valid component: ${name} (type = ${typeof comp}).`
      );
    }
    return comp;
  }

  load(skinObject) {
    if (this.components !== null) {
      throw new Error(
        "Attempted to load a skin while a skin is already loaded" +
          "If you want to change the active skin, call resetSkin first"
      );
    }
    this.components = {};
    const compKeys = Object.keys(skinObject.components);
    for (let i = 0; i < compKeys.length; ++i) {
      const comp = skinObject.components[compKeys[i]];
      this.addComponent(compKeys[i], comp);
    }

    // Now that we have a skin, load our components too
    if (!idx || !idx.components)
      throw new Error("Invalid react-sdk component index");
    for (const c in idx.components) {
      if (!this.components[c]) this.components[c] = idx.components[c];
    }
  }

  addComponent(name, comp) {
    let slot = name;
    if (comp.replaces !== undefined) {
      if (comp.replaces.indexOf(".") > -1) {
        slot = comp.replaces;
      } else {
        slot =
          name.substr(0, name.lastIndexOf(".") + 1) +
          comp.replaces.split(".").pop();
      }
    }
    this.components[slot] = comp;
  }

  reset() {
    this.components = null;
  }
}

global.mxSkinner = new Skinner();
