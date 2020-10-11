"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const tc = __importStar(require("@actions/tool-cache"));
const exec = __importStar(require("@actions/exec"));
const path = __importStar(require("path"));
const VersionInput = "version";
const ConfigInput = "config";
const ImageInput = "image";
const NameInput = "name";
const WaitInput = "wait";
const SkipClusterCreationInput = "skipClusterCreation";
const toolName = "kind";
class KindConfig {
    constructor(version, configFile, image, name, waitDuration, skipClusterCreation) {
        this.version = version;
        this.configFile = configFile;
        this.image = image;
        this.name = name;
        this.waitDuration = waitDuration;
        this.skipClusterCreation = (skipClusterCreation == 'true');
    }
    // returns the arguments to pass to `kind create cluster`
    getCommand() {
        let args = ["create", "cluster"];
        if (this.configFile != "") {
            const wd = process.env[`GITHUB_WORKSPACE`] || "";
            const absPath = path.join(wd, this.configFile);
            args.push("--config", absPath);
        }
        if (this.image != "") {
            args.push("--image", this.image);
        }
        if (this.name != "") {
            args.push("--name", this.name);
        }
        if (this.waitDuration != "") {
            args.push("--wait", this.waitDuration);
        }
        return args;
    }
    createCluster() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.skipClusterCreation)
                return;
            console.log("Executing kind with args " + this.getCommand());
            yield exec.exec("kind", this.getCommand());
        });
    }
}
exports.KindConfig = KindConfig;
function getKindConfig() {
    const v = core.getInput(VersionInput);
    const c = core.getInput(ConfigInput);
    const i = core.getInput(ImageInput);
    const n = core.getInput(NameInput);
    const w = core.getInput(WaitInput);
    const s = core.getInput(SkipClusterCreationInput);
    return new KindConfig(v, c, i, n, w, s);
}
exports.getKindConfig = getKindConfig;
// this action should always be run from a Linux worker
function downloadKind(version) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = `https://github.com/kubernetes-sigs/kind/releases/download/${version}/kind-linux-amd64`;
        console.log("downloading kind from " + url);
        let downloadPath = null;
        downloadPath = yield tc.downloadTool(url);
        yield exec.exec("chmod", ["+x", downloadPath]);
        let toolPath = yield tc.cacheFile(downloadPath, "kind", toolName, version);
        core.debug(`kind is cached under ${toolPath}`);
        return toolPath;
    });
}
exports.downloadKind = downloadKind;
function getKind(version) {
    return __awaiter(this, void 0, void 0, function* () {
        let toolPath = tc.find(toolName, version);
        if (toolPath === "") {
            toolPath = yield downloadKind(version);
        }
        return toolPath;
    });
}
exports.getKind = getKind;
