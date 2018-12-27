/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/
import { CheTask, CheTaskMain, CheTaskService, CheTaskClient, PLUGIN_RPC_CONTEXT } from "../common/che-protocol";
import { RPCProtocol } from '@theia/plugin-ext/lib/api/rpc-protocol';
import { interfaces, injectable } from 'inversify';

@injectable()
export class CheTaskMainImpl implements CheTaskMain{
    private readonly delegate: CheTaskService;
    private readonly proxy: CheTask;
    private readonly cheTaskClient: CheTaskClient;
    constructor(container: interfaces.Container, rpc: RPCProtocol) {
        this.delegate = container.get(CheTaskService);
        this.proxy = rpc.getProxy(PLUGIN_RPC_CONTEXT.CHE_TASK);
        this.cheTaskClient = container.get(CheTaskClient);
        this.cheTaskClient.onKillEvent(id => {
            if (this.proxy) {
                this.proxy.$killTask(id);
            }
        });
        this.cheTaskClient.setTaskInfoHandler(id => this.proxy.$getTaskInfo(id));
        this.cheTaskClient.setRunTaskHandler((config, ctx) => this.proxy.$runTask(config, ctx));
    }
    async $registerTaskRunner(type: string): Promise<void> {
        return await this.delegate.registerTaskRunner(type);
    }

    async $disposeTaskRunner(type: string): Promise<void> {
        await this.delegate.disposeTaskRunner(type);
    }
}
